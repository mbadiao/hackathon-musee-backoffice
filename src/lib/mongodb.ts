import { MongoClient, Db } from 'mongodb';

let cachedClient: MongoClient | null = null;

async function connectToDatabase(): Promise<MongoClient> {
  if (!process.env.MONGODB_URI) {
    throw new Error('Veuillez définir la variable d\'environnement MONGODB_URI');
  }

  if (cachedClient) {
    return cachedClient;
  }

  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  cachedClient = client;
  
  return client;
}

// Fonction helper pour obtenir la base de données
export async function getDatabase(): Promise<Db> {
  const client = await connectToDatabase();
  // Utiliser la base de données par défaut de la connexion (celle spécifiée dans l'URI)
  // ou 'test' si aucune n'est spécifiée
  return client.db(); // Utilise la DB par défaut
}

export default connectToDatabase;

