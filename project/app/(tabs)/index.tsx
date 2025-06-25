import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, Play, BookOpen, Trophy } from 'lucide-react-native';
import { router } from 'expo-router';
import { GameStorage } from '@/utils/storage';

export default function HomeTab() {
  const [playerData, setPlayerData] = useState(null);
  const scaleAnim = new Animated.Value(1);

  useEffect(() => {
    loadPlayerData();
    
    // Pulse animation for play button
    const pulse = () => {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => pulse());
    };
    pulse();
  }, []);

  const loadPlayerData = async () => {
    const data = await GameStorage.getPlayerData();
    setPlayerData(data);
  };

  const handlePlayPress = () => {
    router.push('/game');
  };

  const handleProgressPress = () => {
    router.push('/progress');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#3B82F6', '#8B5CF6']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.welcome}>Welcome to</Text>
          <Text style={styles.title}>JSON Quest</Text>
          <Text style={styles.subtitle}>🧙‍♂️ Learn JSON with Magic & Mystery 🕵️‍♀️</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{playerData?.currentLevel || 1}</Text>
            <Text style={styles.statLabel}>Current Level</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{playerData?.totalXP || 0}</Text>
            <Text style={styles.statLabel}>Total XP</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{playerData?.achievements?.length || 0}</Text>
            <Text style={styles.statLabel}>Achievements</Text>
          </View>
        </View>

        <Animated.View style={[styles.playButton, { transform: [{ scale: scaleAnim }] }]}>
          <TouchableOpacity onPress={handlePlayPress} style={styles.playButtonTouch}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.playButtonGradient}
            >
              <Play size={32} color="white" />
              <Text style={styles.playButtonText}>Start Playing</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.featuresContainer}>
          <TouchableOpacity style={styles.featureCard} onPress={handleProgressPress}>
            <Trophy size={24} color="#F59E0B" />
            <Text style={styles.featureTitle}>View Progress</Text>
            <Text style={styles.featureDescription}>Check your achievements and level progress</Text>
          </TouchableOpacity>

          <View style={styles.featureCard}>
            <BookOpen size={24} color="#8B5CF6" />
            <Text style={styles.featureTitle}>Learn JSON</Text>
            <Text style={styles.featureDescription}>Master JSON reading through fun challenges</Text>
          </View>

          <View style={styles.featureCard}>
            <Sparkles size={24} color="#EF4444" />
            <Text style={styles.featureTitle}>Magic Powers</Text>
            <Text style={styles.featureDescription}>Unlock new abilities as you progress</Text>
          </View>
        </View>

        <View style={styles.howToPlay}>
          <Text style={styles.howToPlayTitle}>How to Play 🎮</Text>
          <View style={styles.instructionStep}>
            <Text style={styles.stepNumber}>1</Text>
            <Text style={styles.stepText}>Choose your character: Wizard or Spy</Text>
          </View>
          <View style={styles.instructionStep}>
            <Text style={styles.stepNumber}>2</Text>
            <Text style={styles.stepText}>Read JSON clues to solve puzzles</Text>
          </View>
          <View style={styles.instructionStep}>
            <Text style={styles.stepNumber}>3</Text>
            <Text style={styles.stepText}>Complete levels to unlock new challenges</Text>
          </View>
          <View style={styles.instructionStep}>
            <Text style={styles.stepNumber}>4</Text>
            <Text style={styles.stepText}>Collect achievements and level up!</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  welcome: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  title: {
    fontSize: 32,
    color: 'white',
    fontWeight: 'bold',
    marginTop: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  playButton: {
    marginBottom: 30,
  },
  playButtonTouch: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  playButtonGradient: {
    paddingVertical: 20,
    paddingHorizontal: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 12,
  },
  featuresContainer: {
    marginBottom: 30,
  },
  featureCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    lineHeight: 20,
  },
  howToPlay: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  howToPlayTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  instructionStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3B82F6',
    color: 'white',
    textAlign: 'center',
    lineHeight: 28,
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 12,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
});