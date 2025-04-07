import { User } from "../types";

// Mock user profiles
export const mockUsers: User[] = [
  {
    userId: "001",
    email: "john.doe@opendatalabs.xyz",
    timestamp: 1742766945802,
    profile: {
      name: "John Doe",
      locale: "en-US",
    },
    storage: {
      percentUsed: 12.67,
    },
    metadata: {
      source: "Google",
      collectionDate: "2023-01-15T10:30:00Z",
      dataType: "profile",
    },
  },
  {
    userId: "002",
    email: "jane.smith@opendatalabs.xyz",
    timestamp: 1742800353456,
    profile: {
      name: "Jane Smith",
      locale: "en-GB",
    },
    storage: {
      percentUsed: 23.45,
    },
    metadata: {
      source: "Google",
      collectionDate: "2023-02-20T08:45:00Z",
      dataType: "profile",
    },
  },
  {
    userId: "003",
    email: "carlos.rodriguez@opendatalabs.xyz",
    timestamp: 1742908097321,
    profile: {
      name: "Carlos Rodriguez",
      locale: "es-ES",
    },
    storage: {
      percentUsed: 45.19,
    },
    metadata: {
      source: "Google",
      collectionDate: "2023-03-05T14:20:00Z",
      dataType: "profile",
    },
  },
  {
    userId: "004",
    email: "emma.wilson@opendatalabs.xyz",
    timestamp: 1742908097322,
    profile: {
      name: "Emma Wilson",
      locale: "en-AU",
    },
    storage: {
      percentUsed: 8.33,
    },
    metadata: {
      source: "Google",
      collectionDate: "2023-01-28T11:10:00Z",
      dataType: "profile",
    },
  },
  {
    userId: "005",
    email: "yuki.tanaka@opendatalabs.xyz",
    timestamp: 1742908097323,
    profile: {
      name: "Yuki Tanaka",
      locale: "ja-JP",
    },
    storage: {
      percentUsed: 67.12,
    },
    metadata: {
      source: "Google",
      collectionDate: "2023-02-10T09:15:00Z",
      dataType: "profile",
    },
  },
  {
    userId: "006",
    email: "marie.dupont@opendatalabs.xyz",
    timestamp: 1742908097324,
    profile: {
      name: "Marie Dupont",
      locale: "fr-FR",
    },
    storage: {
      percentUsed: 32.98,
    },
    metadata: {
      source: "Google",
      collectionDate: "2023-03-18T16:40:00Z",
      dataType: "profile",
    },
  },
  {
    userId: "007",
    email: "wei.chen@opendatalabs.xyz",
    timestamp: 1742908097325,
    profile: {
      name: "Wei Chen",
      locale: "zh-CN",
    },
    storage: {
      percentUsed: 50.75,
    },
    metadata: {
      source: "Google",
      collectionDate: "2023-02-05T13:25:00Z",
      dataType: "profile",
    },
  },
  {
    userId: "008",
    email: "sophia.muller@opendatalabs.xyz",
    timestamp: 1742908097326,
    profile: {
      name: "Sophia Müller",
      locale: "de-DE",
    },
    storage: {
      percentUsed: 14.29,
    },
    metadata: {
      source: "Google",
      collectionDate: "2023-01-20T07:55:00Z",
      dataType: "profile",
    },
  },
  {
    userId: "009",
    email: "lucas.silva@opendatalabs.xyz",
    timestamp: 1742908097327,
    profile: {
      name: "Lucas Silva",
      locale: "pt-BR",
    },
    storage: {
      percentUsed: 88.45,
    },
    metadata: {
      source: "Google",
      collectionDate: "2023-03-10T15:30:00Z",
      dataType: "profile",
    },
  },
  {
    userId: "010",
    email: "olivia.brown@opendatalabs.xyz",
    timestamp: 1742908097328,
    profile: {
      name: "Olivia Brown",
      locale: "en-CA",
    },
    storage: {
      percentUsed: 36.14,
    },
    metadata: {
      source: "Google",
      collectionDate: "2023-02-15T12:05:00Z",
      dataType: "profile",
    },
  },
  // Additional mock users
  {
    userId: "011",
    email: "raj.patel@opendatalabs.xyz",
    timestamp: 1742908097329,
    profile: {
      name: "Raj Patel",
      locale: "en-IN",
    },
    storage: {
      percentUsed: 27.53,
    },
    metadata: {
      source: "Google",
      collectionDate: "2023-04-05T09:20:00Z",
      dataType: "profile",
    },
  },
  {
    userId: "012",
    email: "anna.kowalski@opendatalabs.xyz",
    timestamp: 1742908097330,
    profile: {
      name: "Anna Kowalski",
      locale: "pl-PL",
    },
    storage: {
      percentUsed: 42.67,
    },
    metadata: {
      source: "Google",
      collectionDate: "2023-03-22T14:10:00Z",
      dataType: "profile",
    },
  },
  {
    userId: "013",
    email: "hiroshi.yamamoto@opendatalabs.xyz",
    timestamp: 1742908097331,
    profile: {
      name: "Hiroshi Yamamoto",
      locale: "ja-JP",
    },
    storage: {
      percentUsed: 71.29,
    },
    metadata: {
      source: "Google",
      collectionDate: "2023-04-15T08:30:00Z",
      dataType: "profile",
    },
  },
  {
    userId: "014",
    email: "fatima.alfarsi@opendatalabs.xyz",
    timestamp: 1742908097332,
    profile: {
      name: "Fatima Al-Farsi",
      locale: "ar-SA",
    },
    storage: {
      percentUsed: 19.84,
    },
    metadata: {
      source: "Google",
      collectionDate: "2023-02-28T11:45:00Z",
      dataType: "profile",
    },
  },
  {
    userId: "015",
    email: "kim.minji@opendatalabs.xyz",
    timestamp: 1742908097333,
    profile: {
      name: "Kim Min-Ji",
      locale: "ko-KR",
    },
    storage: {
      percentUsed: 55.32,
    },
    metadata: {
      source: "Google",
      collectionDate: "2023-03-30T16:20:00Z",
      dataType: "profile",
    },
  },
  // More users with repeated locales
  {
    userId: "016",
    email: "michael.johnson@opendatalabs.xyz",
    timestamp: 1742908097334,
    profile: {
      name: "Michael Johnson",
      locale: "en-US",
    },
    storage: {
      percentUsed: 28.76,
    },
    metadata: {
      source: "Google",
      collectionDate: "2023-01-25T15:40:00Z",
      dataType: "profile",
    },
  },
  {
    userId: "017",
    email: "sarah.williams@opendatalabs.xyz",
    timestamp: 1742908097335,
    profile: {
      name: "Sarah Williams",
      locale: "en-US",
    },
    storage: {
      percentUsed: 63.19,
    },
    metadata: {
      source: "Google",
      collectionDate: "2023-02-12T11:25:00Z",
      dataType: "profile",
    },
  },
  {
    userId: "018",
    email: "david.thompson@opendatalabs.xyz",
    timestamp: 1742908097336,
    profile: {
      name: "David Thompson",
      locale: "en-GB",
    },
    storage: {
      percentUsed: 41.88,
    },
    metadata: {
      source: "Google",
      collectionDate: "2023-03-18T09:35:00Z",
      dataType: "profile",
    },
  },
  {
    userId: "019",
    email: "emily.davis@opendatalabs.xyz",
    timestamp: 1742908097337,
    profile: {
      name: "Emily Davis",
      locale: "en-GB",
    },
    storage: {
      percentUsed: 17.43,
    },
    metadata: {
      source: "Google",
      collectionDate: "2023-01-30T17:15:00Z",
      dataType: "profile",
    },
  },
  {
    userId: "020",
    email: "pedro.sanchez@opendatalabs.xyz",
    timestamp: 1742908097338,
    profile: {
      name: "Pedro Sanchez",
      locale: "es-ES",
    },
    storage: {
      percentUsed: 82.56,
    },
    metadata: {
      source: "Google",
      collectionDate: "2023-02-22T13:50:00Z",
      dataType: "profile",
    },
  },
  {
    userId: "021",
    email: "sofia.garcia@opendatalabs.xyz",
    timestamp: 1742908097339,
    profile: {
      name: "Sofia Garcia",
      locale: "es-ES",
    },
    storage: {
      percentUsed: 34.91,
    },
    metadata: {
      source: "Google",
      collectionDate: "2023-03-27T10:10:00Z",
      dataType: "profile",
    },
  },
  {
    userId: "022",
    email: "kenji.sato@opendatalabs.xyz",
    timestamp: 1742908097340,
    profile: {
      name: "Kenji Sato",
      locale: "ja-JP",
    },
    storage: {
      percentUsed: 49.23,
    },
    metadata: {
      source: "Google",
      collectionDate: "2023-01-08T08:05:00Z",
      dataType: "profile",
    },
  },
  {
    userId: "023",
    email: "aiko.nakamura@opendatalabs.xyz",
    timestamp: 1742908097341,
    profile: {
      name: "Aiko Nakamura",
      locale: "ja-JP",
    },
    storage: {
      percentUsed: 73.67,
    },
    metadata: {
      source: "Google",
      collectionDate: "2023-02-18T14:30:00Z",
      dataType: "profile",
    },
  },
  {
    userId: "024",
    email: "jean.petit@opendatalabs.xyz",
    timestamp: 1742908097342,
    profile: {
      name: "Jean Petit",
      locale: "fr-FR",
    },
    storage: {
      percentUsed: 25.18,
    },
    metadata: {
      source: "Google",
      collectionDate: "2023-03-14T12:25:00Z",
      dataType: "profile",
    },
  },
  {
    userId: "025",
    email: "sophie.martin@opendatalabs.xyz",
    timestamp: 1742908097343,
    profile: {
      name: "Sophie Martin",
      locale: "fr-FR",
    },
    storage: {
      percentUsed: 58.94,
    },
    metadata: {
      source: "Google",
      collectionDate: "2023-01-22T16:45:00Z",
      dataType: "profile",
    },
  },
  {
    userId: "026",
    email: "li.wei@opendatalabs.xyz",
    timestamp: 1742908097344,
    profile: {
      name: "Li Wei",
      locale: "zh-CN",
    },
    storage: {
      percentUsed: 31.45,
    },
    metadata: {
      source: "Google",
      collectionDate: "2023-02-27T09:05:00Z",
      dataType: "profile",
    },
  },
  {
    userId: "027",
    email: "zhang.min@opendatalabs.xyz",
    timestamp: 1742908097345,
    profile: {
      name: "Zhang Min",
      locale: "zh-CN",
    },
    storage: {
      percentUsed: 69.37,
    },
    metadata: {
      source: "Google",
      collectionDate: "2023-03-09T11:40:00Z",
      dataType: "profile",
    },
  },
  {
    userId: "028",
    email: "thomas.weber@opendatalabs.xyz",
    timestamp: 1742908097346,
    profile: {
      name: "Thomas Weber",
      locale: "de-DE",
    },
    storage: {
      percentUsed: 44.26,
    },
    metadata: {
      source: "Google",
      collectionDate: "2023-01-17T15:20:00Z",
      dataType: "profile",
    },
  },
  {
    userId: "029",
    email: "hannah.schmidt@opendatalabs.xyz",
    timestamp: 1742908097347,
    profile: {
      name: "Hannah Schmidt",
      locale: "de-DE",
    },
    storage: {
      percentUsed: 22.87,
    },
    metadata: {
      source: "Google",
      collectionDate: "2023-02-09T10:15:00Z",
      dataType: "profile",
    },
  },
  {
    userId: "030",
    email: "mateus.oliveira@opendatalabs.xyz",
    timestamp: 1742908097348,
    profile: {
      name: "Mateus Oliveira",
      locale: "pt-BR",
    },
    storage: {
      percentUsed: 53.41,
    },
    metadata: {
      source: "Google",
      collectionDate: "2023-03-24T13:35:00Z",
      dataType: "profile",
    },
  },
];
