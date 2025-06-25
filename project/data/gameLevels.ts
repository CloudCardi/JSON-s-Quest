export interface GameLevel {
  id: number;
  title: string;
  character: 'wizard' | 'spy';
  story: string;
  jsonData: string;
  question: string;
  answers: string[];
  correctAnswer: number;
  hint: string;
  explanation: string;
  xpReward: number;
}

// Optimized level generation with caching
class GameLevelGenerator {
  private static cache = new Map<number, GameLevel>();
  private static templates = {
    wizard: [
      {
        title: "The Wizard's {property}",
        story: "🧙‍♂️ A {adjective} wizard needs help reading their magical profile to find their {property}.",
        hint: "Look for the '{property}' key in the JSON data",
        explanation: "In JSON, you find values by looking at the key. The key '{property}' has the value '{answer}'."
      },
      {
        title: "Magic Spell {property}",
        story: "🧙‍♂️ The wizard needs to cast a spell! Find out their {property} level.",
        hint: "Look inside the nested object for '{property}'",
        explanation: "This JSON has nested objects. Navigate through the structure to find the value."
      },
      {
        title: "Wizard's {collection}",
        story: "🧙‍♂️ The wizard keeps magical {collection}. Count how many they have.",
        hint: "Count the items inside the square brackets [ ]",
        explanation: "Arrays are shown with square brackets. Count each item in the list."
      }
    ],
    spy: [
      {
        title: "Agent's Secret {property}",
        story: "🕵️‍♀️ Agent {name} needs to verify their {property} from the secret file.",
        hint: "Numbers in JSON don't have quotes around them",
        explanation: "The key '{property}' contains the value without quotes because it's a {type}."
      },
      {
        title: "Mission {property}",
        story: "🕵️‍♀️ Agent {name} has a classified mission. Find the {property}!",
        hint: "Look inside the 'mission' object for the '{property}' key",
        explanation: "In nested objects, you go deeper: mission → {property} → '{answer}'."
      },
      {
        title: "Spy Network {collection}",
        story: "🕵️‍♀️ The spy network is sharing intel. How many {collection} are there?",
        hint: "Go into the nested object and count the array items",
        explanation: "Navigate to the nested structure and count the items in the array."
      }
    ]
  };

  private static names = {
    wizard: ['Merlin', 'Gandalf', 'Alakazam', 'Zephyr', 'Luna', 'Mystic', 'Sage', 'Arcane', 'Stellar', 'Phoenix'],
    spy: ['Shadow', 'Nova', 'Cipher', 'Ghost', 'Phantom', 'Whisper', 'Apex', 'Viper', 'Storm', 'Raven']
  };

  private static properties = ['name', 'age', 'level', 'power', 'rank', 'status', 'code', 'mission', 'target', 'security'];
  private static collections = ['spells', 'potions', 'gadgets', 'weapons', 'allies', 'missions', 'artifacts', 'scrolls', 'crystals', 'tools'];
  private static adjectives = ['young', 'ancient', 'powerful', 'mysterious', 'legendary', 'skilled', 'wise', 'brave', 'cunning', 'elite'];

  static getLevel(id: number): GameLevel {
    // Return cached level if available
    if (this.cache.has(id)) {
      return this.cache.get(id)!;
    }

    // Generate level on demand
    const level = this.generateLevel(id);
    this.cache.set(id, level);
    return level;
  }

  private static generateLevel(id: number): GameLevel {
    // Use deterministic randomization based on level ID
    const seed = id * 12345;
    const random = (max: number) => Math.floor((seed * 9301 + 49297) % 233280 / 233280 * max);

    const isWizard = random(2) === 0;
    const character = isWizard ? 'wizard' : 'spy';
    const templates = this.templates[character];
    const template = templates[random(templates.length)];
    
    const names = this.names[character];
    const name = names[random(names.length)];
    const property = this.properties[random(this.properties.length)];
    const adjective = this.adjectives[random(this.adjectives.length)];
    
    let jsonData: string;
    let question: string;
    let answers: string[];
    let correctAnswer: number;
    let actualAnswer: string;

    if (id <= 100) {
      // Simple single-level JSON
      if (property === 'name') {
        actualAnswer = name;
        jsonData = `{
  "name": "${name}",
  "age": ${20 + random(80)},
  "${isWizard ? 'magic' : 'rank'}": "${isWizard ? 'strong' : 'agent'}"
}`;
        question = `What is the ${character}'s name?`;
        answers = [name, names[(names.indexOf(name) + 1) % names.length], names[(names.indexOf(name) + 2) % names.length], names[(names.indexOf(name) + 3) % names.length]];
      } else if (property === 'age') {
        actualAnswer = String(25 + random(50));
        jsonData = `{
  "name": "${name}",
  "age": ${actualAnswer},
  "${isWizard ? 'magic' : 'rank'}": "${isWizard ? 'strong' : 'senior'}"
}`;
        question = `How old is ${name}?`;
        answers = [actualAnswer, String(Number(actualAnswer) + 5), String(Number(actualAnswer) - 3), String(Number(actualAnswer) + 10)];
      } else {
        actualAnswer = String(random(10) + 1);
        jsonData = `{
  "name": "${name}",
  "level": ${actualAnswer},
  "${isWizard ? 'magic' : 'rank'}": "${isWizard ? 'strong' : 'senior'}"
}`;
        question = `What is ${name}'s level?`;
        answers = [actualAnswer, String(Number(actualAnswer) + 1), String(Number(actualAnswer) + 2), String(Number(actualAnswer) - 1)];
      }
    } else if (id <= 300) {
      // Nested objects
      actualAnswer = String(random(10) + 1);
      const nestedProperty = isWizard ? 'powers' : 'skills';
      const subProperty = isWizard ? ['fire', 'water', 'earth'][random(3)] : ['stealth', 'combat', 'tech'][random(3)];
      
      jsonData = `{
  "name": "${name}",
  "${nestedProperty}": {
    "${subProperty}": ${actualAnswer},
    "other": ${random(10) + 1}
  }
}`;
      question = `What is ${name}'s ${subProperty} ${nestedProperty.slice(0, -1)} level?`;
      answers = [actualAnswer, String(Number(actualAnswer) + 1), String(Number(actualAnswer) + 2), String(Number(actualAnswer) - 1)];
    } else if (id <= 600) {
      // Arrays
      const collection = this.collections[random(this.collections.length)];
      const count = random(5) + 2;
      const items = [];
      for (let i = 0; i < count; i++) {
        items.push(`"item${i + 1}"`);
      }
      
      actualAnswer = String(count);
      jsonData = `{
  "name": "${name}",
  "${collection}": [${items.join(', ')}],
  "rank": "${isWizard ? 'master' : 'senior'}"
}`;
      question = `How many ${collection} does ${name} have?`;
      answers = [actualAnswer, String(count + 1), String(count - 1), String(count + 2)];
    } else {
      // Complex nested structures
      actualAnswer = String(random(10) + 1);
      jsonData = `{
  "agent": {
    "name": "${name}",
    "missions": [
      {"title": "Mission A", "status": "complete", "score": ${random(10) + 1}},
      {"title": "Mission B", "status": "active", "score": ${actualAnswer}}
    ]
  }
}`;
      question = `What is the score of Mission B?`;
      answers = [actualAnswer, String(Number(actualAnswer) + 1), String(Number(actualAnswer) + 2), String(Number(actualAnswer) - 1)];
    }

    // Deterministic shuffle
    const shuffledAnswers = [...answers];
    const correctAnswerValue = shuffledAnswers[0];
    
    for (let i = shuffledAnswers.length - 1; i > 0; i--) {
      const j = (seed + i) % (i + 1);
      [shuffledAnswers[i], shuffledAnswers[j]] = [shuffledAnswers[j], shuffledAnswers[i]];
    }
    
    correctAnswer = shuffledAnswers.indexOf(correctAnswerValue);

    return {
      id,
      title: template.title.replace('{property}', property).replace('{collection}', this.collections[0]),
      character,
      story: template.story
        .replace('{adjective}', adjective)
        .replace('{property}', property)
        .replace('{name}', name)
        .replace('{collection}', this.collections[0]),
      jsonData,
      question,
      answers: shuffledAnswers,
      correctAnswer,
      hint: template.hint.replace('{property}', property),
      explanation: template.explanation
        .replace('{property}', property)
        .replace('{answer}', correctAnswerValue)
        .replace('{type}', isNaN(Number(correctAnswerValue)) ? 'string' : 'number'),
      xpReward: Math.floor(id / 10) + 10
    };
  }

  // Preload levels in batches for better performance
  static preloadLevels(startId: number, count: number = 10) {
    for (let i = startId; i < startId + count && i <= 1000; i++) {
      if (!this.cache.has(i)) {
        this.getLevel(i);
      }
    }
  }
}

// Hand-crafted first 10 levels for consistent experience
const ORIGINAL_LEVELS: GameLevel[] = [
  {
    id: 1,
    title: "The Wizard's Name",
    character: 'wizard',
    story: "🧙‍♂️ A young wizard has lost his spell book! Help him by reading his magical profile to find his name.",
    jsonData: `{
  "name": "Merlin",
  "age": 150,
  "magic": "strong"
}`,
    question: "What is the wizard's name?",
    answers: ["Gandalf", "Merlin", "Harry", "Dumbledore"],
    correctAnswer: 1,
    hint: "Look for the 'name' key in the JSON data",
    explanation: "In JSON, you find values by looking at the key. The key 'name' has the value 'Merlin'.",
    xpReward: 10
  },
  {
    id: 2,
    title: "Spy's Secret Age",
    character: 'spy',
    story: "🕵️‍♀️ Agent Shadow needs to verify her identity. Can you find her age from the secret file?",
    jsonData: `{
  "codename": "Shadow",
  "age": 25,
  "mission": "top-secret"
}`,
    question: "How old is Agent Shadow?",
    answers: ["30", "25", "35", "28"],
    correctAnswer: 1,
    hint: "Numbers in JSON don't have quotes around them",
    explanation: "The key 'age' contains the number 25 (without quotes because it's a number, not text).",
    xpReward: 15
  },
  {
    id: 3,
    title: "Magic Spell Power",
    character: 'wizard',
    story: "🧙‍♂️ The wizard needs to cast a spell! Find out how powerful his magic is.",
    jsonData: `{
  "wizard": "Alakazam",
  "powers": {
    "fire": 8,
    "water": 6,
    "earth": 9
  }
}`,
    question: "What is the wizard's earth magic power level?",
    answers: ["6", "8", "9", "7"],
    correctAnswer: 2,
    hint: "Look inside the 'powers' object for 'earth'",
    explanation: "This JSON has nested objects. Inside 'powers', the 'earth' key has value 9.",
    xpReward: 20
  },
  {
    id: 4,
    title: "Spy's Equipment List",
    character: 'spy',
    story: "🕵️‍♀️ Agent Nova is preparing for a mission. How many gadgets does she have?",
    jsonData: `{
  "agent": "Nova",
  "gadgets": ["watch", "phone", "glasses"],
  "rank": "senior"
}`,
    question: "How many gadgets does Agent Nova have?",
    answers: ["2", "3", "4", "1"],
    correctAnswer: 1,
    hint: "Count the items inside the square brackets [ ]",
    explanation: "Arrays are shown with square brackets. Count each item: 'watch', 'phone', 'glasses' = 3 items.",
    xpReward: 25
  },
  {
    id: 5,
    title: "Wizard's Favorite Spell",
    character: 'wizard',
    story: "🧙‍♂️ Master Zephyr has many spells. Which one is his favorite?",
    jsonData: `{
  "name": "Zephyr",
  "spells": ["fireball", "heal", "shield"],
  "favorite": "heal",
  "level": 45
}`,
    question: "What is Master Zephyr's favorite spell?",
    answers: ["fireball", "heal", "shield", "lightning"],
    correctAnswer: 1,
    hint: "Look for the 'favorite' key - it's separate from the spells array",
    explanation: "Even though 'heal' is in the spells array, the 'favorite' key specifically tells us it's his favorite.",
    xpReward: 30
  },
  {
    id: 6,
    title: "Secret Mission Target",
    character: 'spy',
    story: "🕵️‍♀️ Agent Cipher has a classified mission. Find the target location!",
    jsonData: `{
  "mission": {
    "code": "Operation JSON",
    "target": "Tokyo",
    "status": "active"
  },
  "agent": "Cipher"
}`,
    question: "Where is the mission target located?",
    answers: ["London", "Tokyo", "Paris", "New York"],
    correctAnswer: 1,
    hint: "Look inside the 'mission' object for the 'target' key",
    explanation: "In nested objects, you go deeper: mission → target → 'Tokyo'.",
    xpReward: 35
  },
  {
    id: 7,
    title: "Magical Creatures Count",
    character: 'wizard',
    story: "🧙‍♂️ Wizard Luna keeps magical pets. How many different types does she have?",
    jsonData: `{
  "wizard": "Luna",
  "pets": {
    "dragons": 2,
    "unicorns": 1,
    "phoenixes": 3
  },
  "castle": "Moonstone"
}`,
    question: "How many phoenixes does Luna have?",
    answers: ["1", "2", "3", "4"],
    correctAnswer: 2,
    hint: "Look in the 'pets' object for 'phoenixes'",
    explanation: "Navigate to pets → phoenixes → 3. Luna has 3 phoenixes.",
    xpReward: 40
  },
  {
    id: 8,
    title: "Spy Network Communication",
    character: 'spy',
    story: "🕵️‍♀️ The spy network is sharing intel. What's the security level of the data?",
    jsonData: `{
  "network": "Alpha",
  "data": {
    "classified": true,
    "security": "maximum",
    "agents": ["Ghost", "Phantom", "Whisper"]
  }
}`,
    question: "What is the security level of the classified data?",
    answers: ["minimum", "medium", "maximum", "standard"],
    correctAnswer: 2,
    hint: "Go into the 'data' object and find 'security'",
    explanation: "Inside the 'data' object, the 'security' key has the value 'maximum'.",
    xpReward: 45
  },
  {
    id: 9,
    title: "Ancient Spell Components",
    character: 'wizard',
    story: "🧙‍♂️ The Grand Wizard needs ingredients for an ancient spell. What's the first ingredient?",
    jsonData: `{
  "spell": "Ancient Power",
  "ingredients": [
    {"name": "Dragon Scale", "amount": 3},
    {"name": "Moon Dust", "amount": 1},
    {"name": "Crystal Shard", "amount": 5}
  ]
}`,
    question: "What is the name of the first ingredient?",
    answers: ["Moon Dust", "Dragon Scale", "Crystal Shard", "Star Essence"],
    correctAnswer: 1,
    hint: "Arrays start at position 0. Look at the first object's 'name'",
    explanation: "In the ingredients array, the first item [0] is an object with name: 'Dragon Scale'.",
    xpReward: 50
  },
  {
    id: 10,
    title: "Master Spy's Final Mission",
    character: 'spy',
    story: "🕵️‍♀️ The legendary Agent Apex has one final mission. Is it currently active?",
    jsonData: `{
  "agent": {
    "name": "Apex",
    "rank": "Legend",
    "missions": [
      {"title": "Operation Dawn", "active": false},
      {"title": "Final Protocol", "active": true}
    ]
  }
}`,
    question: "Is the 'Final Protocol' mission active?",
    answers: ["false", "true", "pending", "unknown"],
    correctAnswer: 1,
    hint: "Look in the missions array for 'Final Protocol' and check its 'active' value",
    explanation: "In the missions array, the second mission 'Final Protocol' has active: true.",
    xpReward: 100
  }
];

// Optimized GameLevels object with lazy loading
export const GameLevels = {
  get length() { return 1000; },
  
  // Array-like access with caching
  [Symbol.iterator]: function* () {
    for (let i = 0; i < 1000; i++) {
      yield this[i];
    }
  },
  
  // Proxy for array-like access
  ...new Proxy({}, {
    get(target, prop) {
      const index = Number(prop);
      if (isNaN(index) || index < 0 || index >= 1000) {
        return undefined;
      }
      
      // Return original levels for first 10
      if (index < 10) {
        return ORIGINAL_LEVELS[index];
      }
      
      // Generate and cache other levels
      return GameLevelGenerator.getLevel(index + 1);
    }
  })
};

// Preload function for better performance
export const preloadGameLevels = (currentLevel: number) => {
  // Preload current level and next 5 levels
  GameLevelGenerator.preloadLevels(currentLevel, 5);
};