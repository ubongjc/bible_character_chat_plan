import { db } from './client.js';

// Featured 10 characters seed data
const featuredCharacters = [
  {
    name: 'Jesus of Nazareth',
    type: 'divine',
    alignment: 'benevolent',
    roles: ['messiah', 'teacher', 'healer', 'savior'],
    books: ['Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', 'Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians', 'Thessalonians', 'Timothy', 'Titus', 'Philemon', 'Hebrews', 'James', 'Peter', 'John', 'Jude', 'Revelation'],
    era: '1st century CE',
    geography: ['Galilee', 'Judea', 'Jerusalem', 'Bethlehem', 'Nazareth'],
    description: 'Central figure of Christianity, believed to be the Son of God and the Messiah prophesied in the Old Testament.',
    is_featured: true,
    featured_order: 1,
    influence_score: 1000,
    controversy_level: 0,
  },
  {
    name: 'God',
    type: 'divine',
    alignment: 'benevolent',
    roles: ['creator', 'father', 'judge', 'redeemer'],
    books: ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth', 'Samuel', 'Kings', 'Chronicles', 'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi'],
    era: 'eternal',
    description: 'The supreme being and creator of all. Speaks only through canonical quotations and attributed theological summaries with citations.',
    is_featured: true,
    featured_order: 2,
    influence_score: 1000,
    controversy_level: 0,
  },
  {
    name: 'Moses',
    type: 'person',
    alignment: 'benevolent',
    roles: ['prophet', 'lawgiver', 'liberator', 'leader'],
    books: ['Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Psalms', 'Acts', 'Hebrews'],
    era: 'c. 1400 BCE',
    geography: ['Egypt', 'Sinai', 'Midian'],
    description: 'Prophet and lawgiver who led the Israelites out of Egyptian slavery and received the Ten Commandments.',
    is_featured: true,
    featured_order: 3,
    influence_score: 950,
    controversy_level: 1,
  },
  {
    name: 'King David',
    type: 'person',
    alignment: 'complex',
    roles: ['king', 'warrior', 'psalmist', 'ancestor of Jesus'],
    books: ['Samuel', 'Kings', 'Chronicles', 'Psalms', 'Matthew', 'Luke', 'Acts', 'Romans'],
    era: 'c. 1000 BCE',
    geography: ['Bethlehem', 'Jerusalem', 'Judah'],
    description: 'Second king of Israel, warrior, and psalmist. A man after God\'s own heart who also committed significant sins.',
    is_featured: true,
    featured_order: 4,
    influence_score: 900,
    controversy_level: 3,
  },
  {
    name: 'Paul the Apostle',
    type: 'person',
    alignment: 'benevolent',
    roles: ['apostle', 'missionary', 'theologian', 'writer'],
    books: ['Acts', 'Romans', 'Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians', 'Thessalonians', 'Timothy', 'Titus', 'Philemon'],
    era: '1st century CE',
    geography: ['Tarsus', 'Damascus', 'Jerusalem', 'Antioch', 'Corinth', 'Ephesus', 'Rome'],
    description: 'Former persecutor of Christians who became the most influential early Christian missionary and theologian.',
    is_featured: true,
    featured_order: 5,
    influence_score: 950,
    controversy_level: 2,
  },
  {
    name: 'Mary, Mother of Jesus',
    type: 'person',
    alignment: 'benevolent',
    roles: ['mother of Jesus', 'virgin', 'disciple'],
    books: ['Matthew', 'Luke', 'John', 'Acts'],
    era: '1st century CE',
    geography: ['Nazareth', 'Bethlehem', 'Jerusalem', 'Cana'],
    description: 'Mother of Jesus Christ, chosen to bear the Son of God. A model of faith and obedience.',
    is_featured: true,
    featured_order: 6,
    influence_score: 850,
    controversy_level: 1,
  },
  {
    name: 'Esther',
    type: 'person',
    alignment: 'benevolent',
    roles: ['queen', 'deliverer', 'intercessor'],
    books: ['Esther'],
    era: 'c. 5th century BCE',
    geography: ['Persia', 'Susa'],
    description: 'Jewish queen of Persia who saved her people from genocide through courage and wisdom.',
    is_featured: true,
    featured_order: 7,
    influence_score: 750,
    controversy_level: 0,
  },
  {
    name: 'Judas Iscariot',
    type: 'person',
    alignment: 'antagonist',
    roles: ['apostle', 'betrayer', 'treasurer'],
    books: ['Matthew', 'Mark', 'Luke', 'John', 'Acts'],
    era: '1st century CE',
    geography: ['Judea', 'Jerusalem'],
    description: 'One of the twelve apostles who betrayed Jesus for thirty pieces of silver. His responses may include duplicity and will be flagged.',
    is_featured: true,
    featured_order: 8,
    influence_score: 700,
    controversy_level: 8,
  },
  {
    name: 'Satan',
    type: 'demon',
    alignment: 'antagonist',
    roles: ['adversary', 'tempter', 'accuser', 'deceiver'],
    books: ['Genesis', 'Job', 'Zechariah', 'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', 'Corinthians', 'Ephesians', 'Thessalonians', 'Timothy', 'Hebrews', 'Peter', 'Jude', 'Revelation'],
    era: 'eternal',
    description: 'The adversary and deceiver. Responses may include deception and will be clearly flagged with counter-annotations.',
    is_featured: true,
    featured_order: 9,
    influence_score: 900,
    controversy_level: 10,
  },
  {
    name: 'Michael the Archangel',
    type: 'angel',
    alignment: 'benevolent',
    roles: ['archangel', 'warrior', 'protector', 'prince'],
    books: ['Daniel', 'Jude', 'Revelation'],
    era: 'eternal',
    description: 'Chief archangel and warrior who leads God\'s armies against evil forces.',
    is_featured: true,
    featured_order: 10,
    influence_score: 800,
    controversy_level: 0,
  },
];

async function seed() {
  try {
    console.log('🌱 Seeding database...');

    // Insert featured characters
    for (const char of featuredCharacters) {
      const result = await db.query(
        `INSERT INTO characters (
          name, type, alignment, roles, books, era, geography,
          description, is_featured, featured_order, influence_score, controversy_level
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT DO NOTHING
        RETURNING id`,
        [
          char.name,
          char.type,
          char.alignment,
          char.roles,
          char.books,
          char.era,
          char.geography || [],
          char.description,
          char.is_featured,
          char.featured_order,
          char.influence_score,
          char.controversy_level,
        ]
      );

      if (result.rows.length > 0) {
        const characterId = result.rows[0].id;

        // Create default policy for each character
        const enableDeceptionFlags = char.alignment === 'antagonist';
        const enableCounterVoice = char.alignment === 'antagonist';

        await db.query(
          `INSERT INTO policies (
            character_id, can_say, must_cite, cannot_say,
            style, enable_deception_flags, enable_counter_voice
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (character_id) DO NOTHING`,
          [
            characterId,
            char.books,
            ['doctrine', 'history', 'ethics'],
            ['personal_prophecy', 'modern_politics', 'incitement'],
            JSON.stringify({
              tone: char.alignment === 'antagonist' ? 'confrontational' : 'pastoral',
              archaic_level: 'medium',
              clarity: 'high',
            }),
            enableDeceptionFlags,
            enableCounterVoice,
          ]
        );

        console.log(`  ✓ Created character: ${char.name}`);
      }
    }

    console.log('✅ Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
