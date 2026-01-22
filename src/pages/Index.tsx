import { Header } from '@/components/Header';
import { SettingsScreen } from '@/components/SettingsScreen';
import { FlightSetupScreen } from '@/components/FlightSetupScreen';
import { MetarScreen } from '@/components/MetarScreen';
import { ChatScreen } from '@/components/ChatScreen';
import { useApp } from '@/contexts/AppContext';

export default function Index() {
  const { currentScreen } = useApp();

  return (
    <div className="h-screen bg-background radar-grid relative flex flex-col overflow-hidden">
      {/* Scanline overlay */}
      <div className="fixed inset-0 scanlines pointer-events-none z-50 opacity-10" />
      
      <Header />
      
      <main className="relative z-10 flex-1 flex flex-col min-h-0">
        {currentScreen === 'settings' && <SettingsScreen />}
        {currentScreen === 'flight-setup' && <FlightSetupScreen />}
        {currentScreen === 'metar' && <MetarScreen />}
        {currentScreen === 'chat' && <ChatScreen />}
      </main>
    </div>
  );
}
