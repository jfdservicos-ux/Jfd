import { db } from '../firebase';
import { collection, addDoc, getDocs, query, where, writeBatch, doc } from 'firebase/firestore';
import { MOCK_LEADS, MOCK_ACTIVITIES } from '../mockData';

export async function seedTestData(userId: string) {
  try {
    const batch = writeBatch(db);

    // 1. Seed Other Bankers (for Manager view)
    const usersRef = collection(db, 'users');
    const mockBankers = [
      {
        uid: 'banker-1',
        name: 'Ricardo Silva',
        email: 'ricardo@f4partners.com',
        role: 'banker',
        rating: 'Baa1',
        aum: 15000000,
        mdcPriorities: ['Consultoria de Investimentos (AUM)', 'Investimentos Globais'],
        photoURL: 'https://i.pravatar.cc/150?u=ricardo'
      },
      {
        uid: 'banker-2',
        name: 'Juliana Mendes',
        email: 'juliana@f4partners.com',
        role: 'banker',
        rating: 'Aaa',
        aum: 42000000,
        mdcPriorities: ['Planejamento Financeiro', 'Sucessão Patrimonial'],
        photoURL: 'https://i.pravatar.cc/150?u=juliana'
      }
    ];

    for (const banker of mockBankers) {
      const bankerDoc = doc(usersRef, banker.uid);
      batch.set(bankerDoc, banker, { merge: true });
    }

    // 2. Seed Leads for current user
    const leadsRef = collection(db, 'leads');
    const existingLeads = await getDocs(query(leadsRef, where('bankerUid', '==', userId)));
    
    if (existingLeads.empty) {
      MOCK_LEADS.forEach((lead) => {
        const newDocRef = doc(leadsRef);
        batch.set(newDocRef, {
          ...lead,
          bankerUid: userId,
          createdAt: new Date()
        });
      });
    }

    // 3. Seed Leads for other bankers
    const otherLeads = [
      {
        name: 'Empresa Alpha Tech',
        stage: 'prospecting',
        mdcValue: 5000000,
        probability: 30,
        bankerUid: 'banker-1',
        bankerName: 'Ricardo Silva',
        lastContact: new Date(Date.now() - 86400000 * 5)
      },
      {
        name: 'Família Oliveira',
        stage: 'diagnostic',
        mdcValue: 12000000,
        probability: 60,
        bankerUid: 'banker-1',
        bankerName: 'Ricardo Silva',
        lastContact: new Date(Date.now() - 86400000 * 2)
      },
      {
        name: 'Construtora Sol',
        stage: 'proposal',
        mdcValue: 8500000,
        probability: 80,
        bankerUid: 'banker-2',
        bankerName: 'Juliana Mendes',
        lastContact: new Date(Date.now() - 86400000 * 1)
      },
      {
        name: 'Dr. Marcos Vinicius',
        stage: 'won',
        mdcValue: 25000000,
        probability: 100,
        bankerUid: 'banker-2',
        bankerName: 'Juliana Mendes',
        lastContact: new Date(Date.now() - 86400000 * 10)
      }
    ];

    otherLeads.forEach(lead => {
      const newDocRef = doc(leadsRef);
      batch.set(newDocRef, {
        ...lead,
        createdAt: new Date()
      });
    });

    // 4. Seed Activities
    const activitiesRef = collection(db, 'activities');
    const existingActivities = await getDocs(query(activitiesRef, where('bankerUid', '==', userId)));
    
    if (existingActivities.empty) {
      MOCK_ACTIVITIES.forEach((activity) => {
        const newDocRef = doc(activitiesRef);
        batch.set(newDocRef, {
          ...activity,
          bankerUid: userId,
          date: new Date()
        });
      });
    }

    // 5. Seed Services (Post-Sales)
    const servicesRef = collection(db, 'services');
    const existingServices = await getDocs(query(servicesRef, where('bankerUid', '==', userId)));
    
    if (existingServices.empty) {
      const mockServices = [
        {
          clientName: 'Roberto Almeida',
          serviceType: 'Planejamento Financeiro',
          status: 'Em Execução',
          progress: 65,
          nextStep: 'Revisão de Fluxo de Caixa',
          lastUpdate: new Date(),
          bankerUid: userId,
          createdAt: new Date()
        },
        {
          clientName: 'Ana Paula Costa',
          serviceType: 'Consultoria de Investimentos',
          status: 'Ativo',
          progress: 100,
          nextStep: 'Rebalanceamento Trimestral',
          lastUpdate: new Date(),
          bankerUid: userId,
          createdAt: new Date()
        }
      ];

      mockServices.forEach((service) => {
        const newDocRef = doc(servicesRef);
        batch.set(newDocRef, service);
      });
    }

    await batch.commit();
    return true;
  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  }
}

export async function clearTestData() {
  try {
    const batch = writeBatch(db);
    
    // Clear leads
    const leadsSnapshot = await getDocs(collection(db, 'leads'));
    leadsSnapshot.forEach(doc => batch.delete(doc.ref));
    
    // Clear activities
    const activitiesSnapshot = await getDocs(collection(db, 'activities'));
    activitiesSnapshot.forEach(doc => batch.delete(doc.ref));
    
    // Clear services
    const servicesSnapshot = await getDocs(collection(db, 'services'));
    servicesSnapshot.forEach(doc => batch.delete(doc.ref));
    
    // Clear mock bankers (but keep real users)
    const usersSnapshot = await getDocs(query(collection(db, 'users'), where('uid', 'in', ['banker-1', 'banker-2'])));
    usersSnapshot.forEach(doc => batch.delete(doc.ref));

    await batch.commit();
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    throw error;
  }
}
