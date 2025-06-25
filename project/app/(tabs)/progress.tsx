import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, Star, Target, Calendar, Award, TrendingUp } from 'lucide-react-native';
import { GameStorage } from '@/utils/storage';
import { GameLevels } from '@/data/gameLevels';

export default function ProgressTab() {
  const [playerData, setPlayerData] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);

  useEffect(() => {
    loadPlayerData();
  }, []);

  const loadPlayerData = async () => {
    const data = await GameStorage.getPlayerData();
    setPlayerData(data);
    calculateAchievements(data);
  };

  const calculateAchievements = (data: any) => {
    const achievementsList = [];
    
    if (data.levelsCompleted >= 1) {
      achievementsList.push({
        id: 'first_level',
        title: 'First Steps',
        description: 'Complete your first level',
        icon: '🎯',
        unlocked: true,
      });
    }
    
    if (data.levelsCompleted >= 10) {
      achievementsList.push({
        id: 'apprentice',
        title: 'JSON Apprentice',
        description: 'Complete 10 levels',
        icon: '🧙‍♂️',
        unlocked: true,
      });
    }
    
    if (data.levelsCompleted >= 50) {
      achievementsList.push({
        id: 'journeyman',
        title: 'JSON Journeyman',
        description: 'Complete 50 levels',
        icon: '🕵️‍♂️',
        unlocked: true,
      });
    }
    
    if (data.levelsCompleted >= 100) {
      achievementsList.push({
        id: 'master',
        title: 'JSON Master',
        description: 'Complete 100 levels',
        icon: '👑',
        unlocked: true,
      });
    }
    
    if (data.levelsCompleted >= 250) {
      achievementsList.push({
        id: 'expert',
        title: 'JSON Expert',
        description: 'Complete 250 levels',
        icon: '💎',
        unlocked: true,
      });
    }
    
    if (data.levelsCompleted >= 500) {
      achievementsList.push({
        id: 'legend',
        title: 'JSON Legend',
        description: 'Complete 500 levels',
        icon: '🌟',
        unlocked: true,
      });
    }
    
    if (data.levelsCompleted >= 1000) {
      achievementsList.push({
        id: 'grandmaster',
        title: 'JSON Grandmaster',
        description: 'Complete all 1000 levels',
        icon: '🏆',
        unlocked: true,
      });
    }
    
    if (data.totalXP >= 100) {
      achievementsList.push({
        id: 'xp_collector',
        title: 'XP Collector',
        description: 'Earn 100 total XP',
        icon: '⭐',
        unlocked: true,
      });
    }
    
    if (data.totalXP >= 1000) {
      achievementsList.push({
        id: 'xp_master',
        title: 'XP Master',
        description: 'Earn 1000 total XP',
        icon: '🌟',
        unlocked: true,
      });
    }

    if (data.totalXP >= 10000) {
      achievementsList.push({
        id: 'xp_legend',
        title: 'XP Legend',
        description: 'Earn 10,000 total XP',
        icon: '💫',
        unlocked: true,
      });
    }

    // Add locked achievements based on progress
    const lockedAchievements = [];
    
    if (data.levelsCompleted < 10) {
      lockedAchievements.push({ id: 'apprentice', title: 'JSON Apprentice', description: 'Complete 10 levels', icon: '🧙‍♂️', unlocked: false });
    }
    if (data.levelsCompleted < 50) {
      lockedAchievements.push({ id: 'journeyman', title: 'JSON Journeyman', description: 'Complete 50 levels', icon: '🕵️‍♂️', unlocked: false });
    }
    if (data.levelsCompleted < 100) {
      lockedAchievements.push({ id: 'master', title: 'JSON Master', description: 'Complete 100 levels', icon: '👑', unlocked: false });
    }
    if (data.levelsCompleted < 250) {
      lockedAchievements.push({ id: 'expert', title: 'JSON Expert', description: 'Complete 250 levels', icon: '💎', unlocked: false });
    }
    if (data.levelsCompleted < 500) {
      lockedAchievements.push({ id: 'legend', title: 'JSON Legend', description: 'Complete 500 levels', icon: '🌟', unlocked: false });
    }
    if (data.levelsCompleted < 1000) {
      lockedAchievements.push({ id: 'grandmaster', title: 'JSON Grandmaster', description: 'Complete all 1000 levels', icon: '🏆', unlocked: false });
    }

    setAchievements([...achievementsList, ...lockedAchievements.slice(0, 6)]);
  };

  const getProgressPercentage = () => {
    if (!playerData) return 0;
    return Math.round((playerData.levelsCompleted / GameLevels.length) * 100);
  };

  const formatLastPlayed = () => {
    if (!playerData?.lastPlayed) return 'Never';
    const date = new Date(playerData.lastPlayed);
    return date.toLocaleDateString();
  };

  const getPlayerLevel = () => {
    if (!playerData?.totalXP) return 1;
    return Math.floor(playerData.totalXP / 100) + 1;
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#F59E0B', '#EF4444']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Trophy size={32} color="white" />
          <Text style={styles.title}>Your Progress</Text>
          <Text style={styles.subtitle}>Track your JSON learning journey</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <TrendingUp size={24} color="#3B82F6" />
            <Text style={styles.statNumber}>{playerData?.currentLevel || 1}</Text>
            <Text style={styles.statLabel}>Current Level</Text>
          </View>
          
          <View style={styles.statCard}>
            <Star size={24} color="#F59E0B" />
            <Text style={styles.statNumber}>{playerData?.totalXP || 0}</Text>
            <Text style={styles.statLabel}>Total XP</Text>
          </View>
          
          <View style={styles.statCard}>
            <Target size={24} color="#10B981" />
            <Text style={styles.statNumber}>{playerData?.levelsCompleted || 0}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          
          <View style={styles.statCard}>
            <Award size={24} color="#8B5CF6" />
            <Text style={styles.statNumber}>{getPlayerLevel()}</Text>
            <Text style={styles.statLabel}>Player Level</Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>Overall Progress</Text>
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Levels Completed</Text>
              <Text style={styles.progressPercentage}>{getProgressPercentage()}%</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${getProgressPercentage()}%` }
                  ]} 
                />
              </View>
            </View>
            <Text style={styles.progressText}>
              {playerData?.levelsCompleted || 0} of {GameLevels.length} levels completed
            </Text>
            <Text style={styles.progressSubtext}>
              Last played: {formatLastPlayed()}
            </Text>
          </View>
        </View>

        <View style={styles.achievementsSection}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.achievementsGrid}>
            {achievements.map((achievement) => (
              <View 
                key={achievement.id} 
                style={[
                  styles.achievementCard,
                  achievement.unlocked ? styles.unlockedAchievement : styles.lockedAchievement
                ]}
              >
                <Text style={[
                  styles.achievementIcon,
                  !achievement.unlocked && styles.lockedIcon
                ]}>
                  {achievement.icon}
                </Text>
                <Text style={[
                  styles.achievementTitle,
                  !achievement.unlocked && styles.lockedText
                ]}>
                  {achievement.title}
                </Text>
                <Text style={[
                  styles.achievementDescription,
                  !achievement.unlocked && styles.lockedText
                ]}>
                  {achievement.description}
                </Text>
                {achievement.unlocked && (
                  <View style={styles.achievementBadge}>
                    <Award size={16} color="white" />
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.milestoneSection}>
          <Text style={styles.sectionTitle}>Milestones</Text>
          <View style={styles.milestoneCard}>
            <Text style={styles.milestoneTitle}>Next Milestone</Text>
            {playerData?.levelsCompleted < 10 && (
              <Text style={styles.milestoneText}>
                Complete {10 - (playerData?.levelsCompleted || 0)} more levels to become a JSON Apprentice!
              </Text>
            )}
            {playerData?.levelsCompleted >= 10 && playerData?.levelsCompleted < 50 && (
              <Text style={styles.milestoneText}>
                Complete {50 - playerData.levelsCompleted} more levels to become a JSON Journeyman!
              </Text>
            )}
            {playerData?.levelsCompleted >= 50 && playerData?.levelsCompleted < 100 && (
              <Text style={styles.milestoneText}>
                Complete {100 - playerData.levelsCompleted} more levels to become a JSON Master!
              </Text>
            )}
            {playerData?.levelsCompleted >= 100 && playerData?.levelsCompleted < 250 && (
              <Text style={styles.milestoneText}>
                Complete {250 - playerData.levelsCompleted} more levels to become a JSON Expert!
              </Text>
            )}
            {playerData?.levelsCompleted >= 250 && playerData?.levelsCompleted < 500 && (
              <Text style={styles.milestoneText}>
                Complete {500 - playerData.levelsCompleted} more levels to become a JSON Legend!
              </Text>
            )}
            {playerData?.levelsCompleted >= 500 && playerData?.levelsCompleted < 1000 && (
              <Text style={styles.milestoneText}>
                Complete {1000 - playerData.levelsCompleted} more levels to become a JSON Grandmaster!
              </Text>
            )}
            {playerData?.levelsCompleted >= 1000 && (
              <Text style={styles.milestoneText}>
                🎉 Congratulations! You've mastered all 1000 levels!
              </Text>
            )}
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
  title: {
    fontSize: 28,
    color: 'white',
    fontWeight: 'bold',
    marginTop: 12,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 30,
  },
  statCard: {
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
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  progressSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  progressCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
  },
  progressBarContainer: {
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  progressSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  achievementsSection: {
    marginBottom: 30,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementCard: {
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
    position: 'relative',
  },
  unlockedAchievement: {
    borderWidth: 2,
    borderColor: '#10B981',
  },
  lockedAchievement: {
    opacity: 0.6,
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  lockedIcon: {
    opacity: 0.5,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  lockedText: {
    color: '#9CA3AF',
  },
  achievementBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#10B981',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneSection: {
    marginBottom: 30,
  },
  milestoneCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  milestoneTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  milestoneText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});