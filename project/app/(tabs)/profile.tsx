import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Settings, RotateCcw, Shield, Info, Heart } from 'lucide-react-native';
import { GameStorage } from '@/utils/storage';

export default function ProfileTab() {
  const [playerData, setPlayerData] = useState(null);
  const [selectedCharacter, setSelectedCharacter] = useState('wizard');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPlayerData();
  }, []);

  const loadPlayerData = async () => {
    try {
      setIsLoading(true);
      const data = await GameStorage.getPlayerData();
      setPlayerData(data);
      setSelectedCharacter(data?.character || 'wizard');
    } catch (error) {
      console.error('Error loading player data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCharacterChange = async (character) => {
    try {
      const updatedData = {
        ...playerData,
        character: character,
      };
      
      await GameStorage.savePlayerData(updatedData);
      setPlayerData(updatedData);
      setSelectedCharacter(character);
      
      // Show confirmation
      Alert.alert(
        'Character Changed!',
        `You are now playing as a ${character === 'wizard' ? 'Wizard 🧙‍♂️' : 'Spy 🕵️‍♀️'}!`,
        [{ text: 'Great!', style: 'default' }]
      );
    } catch (error) {
      console.error('Error changing character:', error);
      Alert.alert('Error', 'Failed to change character. Please try again.');
    }
  };

  const handleResetProgress = () => {
    Alert.alert(
      'Reset Progress',
      'Are you sure you want to reset all your progress? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await GameStorage.resetProgress();
              const newData = await GameStorage.getPlayerData();
              setPlayerData(newData);
              setSelectedCharacter(newData.character);
              Alert.alert('Success', 'Your progress has been reset!');
            } catch (error) {
              console.error('Error resetting progress:', error);
              Alert.alert('Error', 'Failed to reset progress. Please try again.');
            }
          }
        }
      ]
    );
  };

  const getPlayerLevel = () => {
    if (!playerData?.totalXP) return 1;
    return Math.floor(playerData.totalXP / 100) + 1;
  };

  const getXPForNextLevel = () => {
    if (!playerData?.totalXP) return 100;
    const currentLevel = getPlayerLevel();
    return currentLevel * 100;
  };

  const getXPProgress = () => {
    if (!playerData?.totalXP) return 0;
    return playerData.totalXP % 100;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={selectedCharacter === 'wizard' ? ['#8B5CF6', '#3B82F6'] : ['#059669', '#0D9488']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatar}>
              {selectedCharacter === 'wizard' ? '🧙‍♂️' : '🕵️‍♀️'}
            </Text>
          </View>
          <Text style={styles.playerName}>JSON Explorer</Text>
          <Text style={styles.playerLevel}>Level {getPlayerLevel()}</Text>
          <Text style={styles.characterType}>
            {selectedCharacter === 'wizard' ? 'Wizard' : 'Spy'}
          </Text>
          <View style={styles.xpContainer}>
            <Text style={styles.xpText}>
              {getXPProgress()}/{getXPForNextLevel() - ((getPlayerLevel() - 1) * 100)} XP
            </Text>
            <View style={styles.xpBar}>
              <View 
                style={[
                  styles.xpFill, 
                  { width: `${(getXPProgress() / (getXPForNextLevel() - ((getPlayerLevel() - 1) * 100))) * 100}%` }
                ]} 
              />
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.characterSection}>
          <Text style={styles.sectionTitle}>Choose Your Character</Text>
          <Text style={styles.sectionDescription}>
            Your character affects the story themes and visual style of your adventure!
          </Text>
          <View style={styles.characterOptions}>
            <TouchableOpacity
              style={[
                styles.characterCard,
                selectedCharacter === 'wizard' && styles.selectedCharacter
              ]}
              onPress={() => handleCharacterChange('wizard')}
              activeOpacity={0.7}
            >
              <Text style={styles.characterEmoji}>🧙‍♂️</Text>
              <Text style={styles.characterName}>Wizard</Text>
              <Text style={styles.characterDescription}>Master of magical JSON spells and enchanted data structures</Text>
              {selectedCharacter === 'wizard' && (
                <View style={styles.selectedBadge}>
                  <Text style={styles.selectedBadgeText}>Selected</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.characterCard,
                selectedCharacter === 'spy' && styles.selectedCharacter
              ]}
              onPress={() => handleCharacterChange('spy')}
              activeOpacity={0.7}
            >
              <Text style={styles.characterEmoji}>🕵️‍♀️</Text>
              <Text style={styles.characterName}>Spy</Text>
              <Text style={styles.characterDescription}>Secret agent decoding classified JSON intelligence</Text>
              {selectedCharacter === 'spy' && (
                <View style={styles.selectedBadge}>
                  <Text style={styles.selectedBadgeText}>Selected</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Your Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{playerData?.totalXP || 0}</Text>
              <Text style={styles.statLabel}>Total XP</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{playerData?.levelsCompleted || 0}</Text>
              <Text style={styles.statLabel}>Levels Completed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{playerData?.currentLevel || 1}</Text>
              <Text style={styles.statLabel}>Current Level</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{Math.floor((playerData?.totalXP || 0) / 10)}</Text>
              <Text style={styles.statLabel}>JSON Skills</Text>
            </View>
          </View>
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Shield size={24} color="#3B82F6" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Privacy & Safety</Text>
                <Text style={styles.settingDescription}>Manage your data and privacy settings</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Info size={24} color="#8B5CF6" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>About JSON Quest</Text>
                <Text style={styles.settingDescription}>Learn more about the app</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Heart size={24} color="#EF4444" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Rate the App</Text>
                <Text style={styles.settingDescription}>Help us improve JSON Quest</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dangerItem} onPress={handleResetProgress}>
            <View style={styles.settingLeft}>
              <RotateCcw size={24} color="#EF4444" />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, styles.dangerText]}>Reset Progress</Text>
                <Text style={styles.settingDescription}>Clear all progress and start over</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>About JSON Quest</Text>
          <Text style={styles.infoText}>
            JSON Quest is designed to help young learners understand JSON (JavaScript Object Notation) 
            through engaging gameplay. Journey with wizards and spies as you decode JSON clues, 
            solve puzzles, and master the art of reading structured data.
          </Text>
          <Text style={styles.versionText}>Version 1.0.0</Text>
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
    paddingVertical: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatar: {
    fontSize: 40,
  },
  playerName: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  playerLevel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  characterType: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
    fontWeight: '600',
  },
  xpContainer: {
    alignItems: 'center',
    marginTop: 16,
    width: '100%',
  },
  xpText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  xpBar: {
    width: '80%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
  },
  xpFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 3,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  characterSection: {
    marginTop: 24,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  characterOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  characterCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    width: '48%',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedCharacter: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
    transform: [{ scale: 1.02 }],
  },
  characterEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  characterName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  characterDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  selectedBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  selectedBadgeText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  statsSection: {
    marginBottom: 30,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
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
  settingsSection: {
    marginBottom: 30,
  },
  settingItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dangerItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    marginLeft: 16,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  settingDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  dangerText: {
    color: '#EF4444',
  },
  infoSection: {
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
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 16,
  },
  versionText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
});