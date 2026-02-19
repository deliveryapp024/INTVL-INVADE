import { useEffect } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';

export default function RecordTab() {
  const router = useRouter();

  useEffect(() => {
    // This tab is handled by the modal in the tab layout
    // The actual screen content is shown in the RecordModal
    // This component just returns null as it's a placeholder for the tab
  }, []);

  return null;
}
