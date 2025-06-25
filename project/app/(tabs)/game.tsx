import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight, Star, CircleCheck as CheckCircle, Circle as XCircle, RotateCcw, Trophy, ArrowLeft } from 'lucide-react-native';
import { GameStorage } from '@/utils/storage';
import { GameLevels, preloadGameLevels } from '@/data/gameLevels';

export default function GameTab() {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [playerData, setPlayerData] = useState<any>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Memoize level data to prevent unnecessary recalculations
  const level = useMemo(() => {
    if (currentLevel < 1 || currentLevel > GameLevels.length) return null;
    return GameLevels[currentLevel - 1];
  }, [currentLevel]);

  // Memoize display character
  const displayCharacter = useMemo(() => {
    return playerData?.character || 'wizard';
  }, [playerData?.character]);

  // Preload levels for better performance
  useEffect(() => {
    preloadGameLevels(currentLevel);
  }, [currentLevel]);

  useEffect(() => {
    loadPlayerData();
  }, []);

  const loadPlayerData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await GameStorage.getPlayerData();
      setPlayerData(data);
      setCurrentLevel(data.currentLevel);
    } catch (error) {
      console.error('Error loading player data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Memoize adapted story to prevent recalculation
  const adaptedStory = useMemo(() => {
    if (!level) return '';
    
    // If the level's character matches player's choice, use as-is
    if (level.character === displayCharacter) {
      return level.story;
    }
    
    // Otherwise, adapt the story to match player's character
    if (displayCharacter === 'wizard') {
      return level.story
        .replace(/🕵️‍♀️/g, '🧙‍♂️')
        .replace(/Agent/g, 'Wizard')
        .replace(/spy/g, 'wizard')
        .replace(/mission/g, 'quest')
        .replace(/classified/g, 'magical')
        .replace(/intel/g, 'spell data');
    } else {
      return level.story
        .replace(/🧙‍♂️/g, '🕵️‍♀️')
        .replace(/Wizard/g, 'Agent')
        .replace(/wizard/g, 'spy')
        .replace(/quest/g, 'mission')
        .replace(/magical/g, 'classified')
        .replace(/spell data/g, 'intel');
    }
  }, [level, displayCharacter]);

  const handleAnswerSelect = useCallback((answerIndex: number) => {
    if (isAnswered) return;
    
    setSelectedAnswer(answerIndex);
    setIsAnswered(true);
    setShowFeedback(true);

    const isCorrect = answerIndex === level.correctAnswer;
    
    setTimeout(() => {
      if (isCorrect) {
        handleCorrectAnswer();
      } else {
        handleIncorrectAnswer();
      }
    }, 1000); // Reduced from 1500ms for faster feedback
  }, [isAnswered, level?.correctAnswer]);

  const handleCorrectAnswer = useCallback(async () => {
    try {
      const xpGained = level.xpReward;
      const newXP = (playerData?.totalXP || 0) + xpGained;
      const newLevel = currentLevel < GameLevels.length ? currentLevel + 1 : currentLevel;
      
      const updatedData = {
        ...playerData,
        currentLevel: newLevel,
        totalXP: newXP,
        levelsCompleted: Math.max(playerData?.levelsCompleted || 0, currentLevel),
        lastPlayed: Date.now(),
      };

      await GameStorage.savePlayerData(updatedData);
      setPlayerData(updatedData);
      setShowLevelComplete(true);
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }, [level?.xpReward, playerData, currentLevel]);

  const handleIncorrectAnswer = useCallback(() => {
    setTimeout(() => {
      Alert.alert(
        '❌ Try Again',
        level.explanation,
        [
          {
            text: 'Retry',
            onPress: resetLevel
          }
        ]
      );
    }, 300); // Reduced delay for faster feedback
  }, [level?.explanation]);

  const resetLevel = useCallback(() => {
    setSelectedAnswer(null);
    setIsAnswered(false);
    setShowFeedback(false);
    setShowLevelComplete(false);
  }, []);

  const handleNextLevel = useCallback(() => {
    if (currentLevel < GameLevels.length) {
      setCurrentLevel(currentLevel + 1);
    }
    resetLevel();
  }, [currentLevel, resetLevel]);

  const handlePreviousLevel = useCallback(() => {
    if (currentLevel > 1 && currentLevel <= (playerData?.levelsCompleted || 0) + 1) {
      setCurrentLevel(currentLevel - 1);
      resetLevel();
    }
  }, [currentLevel, playerData?.levelsCompleted, resetLevel]);

  // Memoize answer styles to prevent recalculation
  const getAnswerStyle = useCallback((index: number) => {
    if (!showFeedback) {
      return selectedAnswer === index ? styles.selectedAnswer : styles.answer;
    }
    
    if (index === level.correctAnswer) {
      return styles.correctAnswer;
    } else if (selectedAnswer === index) {
      return styles.incorrectAnswer;
    }
    return styles.answer;
  }, [showFeedback, selectedAnswer, level?.correctAnswer]);

  const getAnswerIcon = useCallback((index: number) => {
    if (!showFeedback) return null;
    
    if (index === level.correctAnswer) {
      return <CheckCircle size={20} color="white" />;
    } else if (selectedAnswer === index) {
      return <XCircle size={20} color="white" />;
    }
    return null;
  }, [showFeedback, selectedAnswer, level?.correctAnswer]);

  // Memoize gradient colors
  const gradientColors = useMemo(() => {
    return displayCharacter === 'wizard' ? ['#8B5CF6', '#3B82F6'] : ['#059669', '#0D9488'];
  }, [displayCharacter]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!level) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.completedContainer}>
          <Text style={styles.completedTitle}>🎉 Congratulations!</Text>
          <Text style={styles.completedText}>You've completed all 1000 levels!</Text>
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={() => setCurrentLevel(1)}
          >
            <RotateCcw size={20} color="white" />
            <Text style={styles.resetButtonText}>Play Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={gradientColors}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.levelNavigation}>
            <TouchableOpacity 
              style={[styles.navButton, currentLevel <= 1 && styles.navButtonDisabled]}
              onPress={handlePreviousLevel}
              disabled={currentLevel <= 1}
            >
              <ArrowLeft size={20} color={currentLevel <= 1 ? '#9CA3AF' : 'white'} />
            </TouchableOpacity>
            
            <View style={styles.levelInfo}>
              <Text style={styles.levelNumber}>Level {currentLevel}</Text>
              <Text style={styles.levelTitle}>{level.title}</Text>
            </View>
            
            <TouchableOpacity 
              style={[styles.navButton, currentLevel > (playerData?.levelsCompleted || 0) && styles.navButtonDisabled]}
              onPress={handleNextLevel}
              disabled={currentLevel > (playerData?.levelsCompleted || 0)}
            >
              <ArrowRight size={20} color={currentLevel > (playerData?.levelsCompleted || 0) ? '#9CA3AF' : 'white'} />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.character}>{displayCharacter === 'wizard' ? '🧙‍♂️' : '🕵️‍♀️'}</Text>
        </View>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(currentLevel / GameLevels.length) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>{currentLevel}/{GameLevels.length}</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.storyContainer}>
          <Text style={styles.storyText}>{adaptedStory}</Text>
        </View>

        <View style={styles.jsonContainer}>
          <Text style={styles.jsonTitle}>JSON Clue:</Text>
          <View style={styles.jsonBox}>
            <Text style={styles.jsonText}>{level.jsonData}</Text>
          </View>
        </View>

        <View style={styles.questionContainer}>
          <Text style={styles.question}>{level.question}</Text>
        </View>

        <View style={styles.answersContainer}>
          {level.answers.map((answer, index) => (
            <TouchableOpacity
              key={index}
              style={getAnswerStyle(index)}
              onPress={() => handleAnswerSelect(index)}
              disabled={isAnswered}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.answerText,
                (showFeedback && (index === level.correctAnswer || selectedAnswer === index)) && styles.answerTextWhite
              ]}>
                {answer}
              </Text>
              {getAnswerIcon(index)}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.hintContainer}>
          <Text style={styles.hintTitle}>💡 Hint:</Text>
          <Text style={styles.hintText}>{level.hint}</Text>
        </View>

        <View style={styles.rewardContainer}>
          <Star size={16} color="#F59E0B" />
          <Text style={styles.rewardText}>{level.xpReward} XP Reward</Text>
        </View>
      </ScrollView>

      {/* Level Complete Modal */}
      <Modal
        visible={showLevelComplete}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLevelComplete(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Trophy size={48} color="#F59E0B" />
            <Text style={styles.modalTitle}>🎉 Level Complete!</Text>
            <Text style={styles.modalText}>
              Great job! You earned {level.xpReward} XP!
            </Text>
            {currentLevel < GameLevels.length && (
              <Text style={styles.modalSubtext}>
                Ready for Level {currentLevel + 1}?
              </Text>
            )}
            <View style={styles.modalButtons}>
              {currentLevel < GameLevels.length ? (
                <TouchableOpacity 
                  style={styles.modalButton}
                  onPress={handleNextLevel}
                >
                  <Text style={styles.modalButtonText}>Next Level</Text>
                  <ArrowRight size={20} color="white" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={styles.modalButton}
                  onPress={() => setShowLevelComplete(false)}
                >
                  <Text style={styles.modalButtonText}>Continue</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#6B7280',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    alignItems: 'center',
    marginBottom: 20,
  },
  levelNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 12,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  levelInfo: {
    alignItems: 'center',
    flex: 1,
  },
  levelNumber: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  levelTitle: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
    marginTop: 4,
    textAlign: 'center',
  },
  character: {
    fontSize: 32,
    marginTop: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 3,
  },
  progressText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  storyContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  storyText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    textAlign: 'center',
  },
  jsonContainer: {
    marginTop: 20,
  },
  jsonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  jsonBox: {
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  jsonText: {
    fontFamily: 'monospace',
    fontSize: 14,
    color: '#10B981',
    lineHeight: 20,
  },
  questionContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  question: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    lineHeight: 26,
  },
  answersContainer: {
    marginTop: 20,
  },
  answer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedAnswer: {
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#2563EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  correctAnswer: {
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#059669',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  incorrectAnswer: {
    backgroundColor: '#EF4444',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#DC2626',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  answerText: {
    fontSize: 16,
    color: '#1F2937',
    flex: 1,
    fontWeight: '500',
  },
  answerTextWhite: {
    color: 'white',
  },
  hintContainer: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  hintTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 4,
  },
  hintText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rewardText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F59E0B',
    marginLeft: 8,
  },
  completedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  completedTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  completedText: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  resetButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  modalText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginRight: 8,
  },
});