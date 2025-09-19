'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCompletion } from '@/context/CompletionContext';
import { useUser } from '@/context/UserContext';

// --- (The SvgChest, LootDrop, and rewards components/data are the same as before) ---

// This component renders a clickable Minecraft-style chest using SVG.
const SvgChest = ({ onClick, isOpened }: { onClick: () => void; isOpened: boolean; }) => {
  const chestStyle: React.CSSProperties = {
    cursor: isOpened ? 'default' : 'pointer',
    transition: 'transform 0.2s ease',
  };

  const hoverStyle: React.CSSProperties = {
    transform: 'scale(1.1)',
  };

  const [isHovered, setIsHovered] = useState(false);

  return (
    <svg
      width="128"
      height="128"
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      style={isHovered && !isOpened ? { ...chestStyle, ...hoverStyle } : chestStyle}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <g style={{ imageRendering: 'pixelated' }}>
        <path d="M5 11h22v15H5z" fill="#4a2e1a" />
        <path d="M6 12h20v13H6z" fill="#7a5132" />
        <path d="M6 12h20v2H6z" fill="#9d6b4d" />
        <path d="M14 16h4v3h-4z" fill="#c6c6c6" />
        <path d="M15 17h2v1h-2z" fill="#7b7b7b" />
      </g>
    </svg>
  );
};

// This component displays the revealed loot drop.
const LootDrop = ({ reward }: { reward: Reward | null }) => {
  if (!reward) return null;

  const containerStyle: React.CSSProperties = {
    marginTop: '2rem',
    padding: '1rem',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    border: '2px solid #555',
    textAlign: 'center',
    animation: 'fadeIn 0.5s ease-in-out'
  };

  const rewardTextStyle: React.CSSProperties = {
    fontSize: '1.5rem',
    color: '#FFD700',
    marginTop: '1rem',
    textShadow: '2px 2px 0 #000',
  };
  
  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div style={containerStyle}>
        <Image 
          src={reward.imageUrl} 
          alt={reward.name} 
          width={96} 
          height={96}
          style={{ imageRendering: 'pixelated' }}
        />
        <p style={rewardTextStyle}>You got a {reward.name}!</p>
      </div>
    </>
  );
};

interface Reward {
  name: string;
  imageUrl: string;
}

const rewards: Reward[] = [
  { name: 'Diamond Sword', imageUrl: '/images/sword.png' },
  { name: 'Creeper Head', imageUrl: '/images/creeper.png' },
  { name: 'Ender Pearl', imageUrl: '/images/ender-pearl.png' }
];

export default function FinishPage() {
  const { isCompleted: userCompleted } = useCompletion();
  const { user, logout } = useUser();
  const router = useRouter();
  const [isCompleted, setIsCompleted] = useState(false);
  const [revealedReward, setRevealedReward] = useState<Reward | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // This useEffect hook will play the sound when the state changes
  useEffect(() => {
    // Only play the sound when the 'isCompleted' state becomes true
    if (isCompleted) {
      const finalSound = new Audio('/sounds/minecraft-1.mp3'); // Make sure final.mp3 is in your public/sounds folder
      finalSound.play();
    }
  }, [isCompleted]); // This effect runs whenever 'isCompleted' changes

  const handleCompleteClick = () => {
    setIsCompleted(true);
  };

  // Check completion status and handle redirects
  useEffect(() => {
    if (!user) {
      // No user, redirect to home
      window.location.href = '/';
      return;
    }

    // Check multiple sources for completion state
    const storedCompletion = localStorage.getItem('completion_state');
    const userCompletion = localStorage.getItem(`completion_${user.email}`);
    const userFeedbackKey = `submittedFeedback_${user.email}`;
    const submittedFeedback = JSON.parse(localStorage.getItem(userFeedbackKey) || '[]');
    const feedbackCount = submittedFeedback.length;
    
    // Check if user has completed all 25 feedbacks
    const hasCompletedFeedback = feedbackCount >= 25;
    const isActuallyCompleted = userCompleted || storedCompletion === 'true' || userCompletion === 'true' || hasCompletedFeedback;
    
    if (!isActuallyCompleted) {
      window.location.href = '/labs';
    } else {
      setIsLoading(false);
    }
  }, [userCompleted, user]);

  const handleChestClick = () => {
    if (revealedReward) return;
    const randomReward = rewards[Math.floor(Math.random() * rewards.length)];
    setRevealedReward(randomReward);
  };

  const pageStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '2rem',
    textAlign: 'center',
    backgroundImage: "url('/images/gift-bg.jpg')", 
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };
  
  const completeButtonStyle: React.CSSProperties = {
    padding: '1.5rem 3rem',
    backgroundColor: '#5E8D4A',
    color: 'white',
    border: '4px solid',
    borderColor: '#a0a0a0 #414141 #414141 #a0a0a0',
    fontSize: '2rem',
    fontFamily: 'var(--font-minecraft)',
    cursor: 'pointer',
    transition: 'transform 0.2s'
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '1.2rem',
    color: '#e0e0e0',
    maxWidth: '600px',
    marginBottom: '2rem',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  };

  if (isLoading) {
    return (
      <main style={pageStyle}>
        <div style={{ textAlign: 'center', color: 'white', fontFamily: 'var(--font-minecraft)' }}>
          <p>Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      {/* Navigation buttons */}
      {user && (
        <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={() => router.push('/leaderboard')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#FFD700',
              color: '#000',
              border: '2px outset #a0a0a0',
              fontSize: '0.9rem',
              fontFamily: 'var(--font-minecraft)',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            🏆 Leaderboard
          </button>
          <button 
            onClick={logout}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#8B0000',
              color: 'white',
              border: '2px outset #a0a0a0',
              fontSize: '0.9rem',
              fontFamily: 'var(--font-minecraft)',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      )}

      {isCompleted ? (
        // --- REWARD STATE ---
        <>
          <h1 style={{ fontSize: '3rem', textShadow: '3px 3px 0 #000' }}>
            Thank You!
          </h1>
          <p style={subtitleStyle}>
            As a token of our gratitude, please accept this reward. Click the chest to open it!
          </p>
          {!revealedReward ? (
            <SvgChest onClick={handleChestClick} isOpened={!!revealedReward} />
          ) : (
            <LootDrop reward={revealedReward} />
          )}
        </>
      ) : (
        // --- INITIAL STATE ---
        <>
          <h1 style={{ fontSize: '2.5rem', textShadow: '3px 3px 0 #000' }}>
            You&apos;ve reviewed all the products!
          </h1>
          <p style={subtitleStyle}>
            Click the button below to finalize your submission and claim your reward.
          </p>
          <button onClick={handleCompleteClick} style={completeButtonStyle}>
            Complete Feedback
          </button>
        </>
      )}
    </main>
  );
}

