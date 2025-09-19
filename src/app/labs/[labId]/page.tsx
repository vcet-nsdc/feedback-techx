'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import MinecraftCard from '@/components/MinecraftCard';
import { useUser } from '@/context/UserContext';

// --- THIS DATA HAS BEEN UPDATED ---
const db = {
    "labs": [
        {
          "labId": "a",
          "labName": "LAB 308-A",
          "products": [
            { "id": "a1", "name": "Trueconnect.jio", "icon": "📶" },
            { "id": "a2", "name": "Drone", "icon": "🚁" },
            { "id": "a3", "name": "Samsung Ecosystem", "icon": "📱" },
            { "id": "a4", "name": "IP CAMERA", "icon": "📹" },
            { "id": "a5", "name": "100 Billion Tech", "icon": "💰" },
            { "id": "a6", "name": "VSCode", "icon": "💻" },
            { "id": "a7", "name": "Temperature Calibrator", "icon": "🌡" }
          ]
        },
        {
          "labId": "c", // Renamed from 'b' to 'c'
          "labName": "LAB 308-C", // Renamed from 'LAB 308-B'
          "products": [ // Updated product list for Lab C
            { "id": "c1", "name": "SimilaCure", "icon": "💊" },
            { "id": "c2", "name": "Allotrak", "icon": "📊" },
            { "id": "c3", "name": "Reliance Samarth", "icon": "🛍" },
            { "id": "c4", "name": "Video Door Phone", "icon": "🚪" },
            { "id": "c5", "name": "Motherboard Full Setup Raw - 1", "icon": "⚙" },
            { "id": "c6", "name": "Dial Club", "icon": "☎" },
            { "id": "c7", "name": "Website/App", "icon": "🌐" },
            { "id": "c8", "name": "Copilot", "icon": "🤖" },
            { "id": "c9", "name": "IOT Monitoring", "icon": "📡" }
          ]
        },
        {
          "labId": "d",
          "labName": "LAB 308-D",
          "products": [ // Updated product list for Lab D
            { "id": "d1", "name": "DND Services", "icon": "🚫" },
            { "id": "d2", "name": "Her Circle", "icon": "♀" },
            { "id": "d3", "name": "Optimyz", "icon": "📈" },
            { "id": "d4", "name": "RDiscovery", "icon": "🔬" },
            { "id": "d5", "name": "PaperPal", "icon": "📝" },
            { "id": "d6", "name": "MDVR Camera Shivsahi", "icon": "🚌" },
            { "id": "d7", "name": "Motherboard Full Setup Raw - 2", "icon": "🛠" },
            { "id": "d8", "name": "OSM", "icon": "🗺" },
            { "id": "d9", "name": "Apple Ecosystem", "icon": "🍏" },
            { "id": "d10", "name": "EDQuest", "icon": "🎓" }
          ]
        }
    ]
};

function getLabData(labId: string) {
    return db.labs.find((l) => l.labId === labId);
}

export default function LabProductsPage() {
    const params = useParams();
    const { user } = useUser();
    const labId = params.labId as string;

    const [lab, setLab] = useState<{ labName: string; products: Array<{ id: string; name: string; icon: string }> } | null>(null);
    const [submittedIds, setSubmittedIds] = useState<string[]>([]);

    useEffect(() => {
        if (user) {
            const userStorageKey = `submittedFeedback_${user.email}`;
            const storedSubmissions = JSON.parse(localStorage.getItem(userStorageKey) || '[]');
            setSubmittedIds(storedSubmissions);
        }
        const data = getLabData(labId);
        setLab(data || null);
    }, [labId, user]);

    const backButtonStyle: React.CSSProperties = {
      display: 'inline-block',
      padding: '0.75rem 1.5rem',
      marginTop: '1rem',
      backgroundColor: '#7d7d7d',
      border: '4px solid',
      borderColor: '#c6c6c6 #585858 #585858 #c6c6c6',
      color: 'white',
      textDecoration: 'none',
      fontSize: '1rem',
      transition: 'transform 0.2s',
      fontFamily: 'var(--font-minecraft)'
    };

    if (!lab) {
        return <main style={{ textAlign: 'center', padding: '4rem' }}><h1>Loading Lab...</h1></main>;
    }

    return (
        <main style={{ padding: '2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem' }}>{lab.labName}</h1>
                <p style={{ color: '#a0a0a0' }}>Click a product to give feedback!</p>
                
                <Link href="/labs" style={backButtonStyle}>
                    &lt; Back to Lab Menu
                </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
                {lab.products.map((product: { id: string; name: string; icon: string }) => (
                    <MinecraftCard
                        key={product.id}
                        {...product}
                        isSubmitted={submittedIds.includes(product.id)}
                    />
                ))}
            </div>
        </main>
    );
}