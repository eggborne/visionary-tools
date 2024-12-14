import { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import styles from './ToolSelectionArea.module.css';

// Define the structure for our tool data
interface Tool {
  id: string;
  title: string;
  description: string;
  baseUrl: string;
  icon: string;
}

// Our available tools with their separate domain URLs
const tools: Tool[] = [
  {
    id: 'inventory',
    title: 'Inventory Manager',
    description: 'Track and manage your inventory.',
    baseUrl: 'https://visionary.tools/inventory/',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
    </svg>`,
  }
];

export default function ToolSelectionArea() {
  const [visibleTools, setVisibleTools] = useState<string[]>([]);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const auth = getAuth();

  useEffect(() => {
    // Get the current user's ID token when the component mounts
    const getAuthToken = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const token = await user.getIdToken();
          setAuthToken(token);
        } catch (error) {
          console.error('Error getting auth token:', error);
        }
      }
    };

    getAuthToken();
  }, [auth]);

  useEffect(() => {
    // Animate tools appearing one by one
    const showTools = async () => {
      for (const tool of tools) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setVisibleTools(prev => [...prev, tool.id]);
      }
    };

    showTools();
  }, []);

  const handleToolClick = async (tool: Tool) => {
    // Refresh the token before redirecting
    try {
      const user = auth.currentUser;
      if (user) {
        const freshToken = await user.getIdToken(true);
        // Construct the URL with the auth token
        const url = new URL(tool.baseUrl);
        url.searchParams.set('token', freshToken);
        window.location.href = url.toString();
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
    }
  };

  return (
    <div className={styles.toolGrid}>
      {tools.map(tool => (
        <a
          key={tool.id}
          href="#"
          onClick={(e) => {
            e.preventDefault();
            handleToolClick(tool);
          }}
          className={styles.toolCard}
          style={{
            opacity: visibleTools.includes(tool.id) ? 1 : 0,
            transform: visibleTools.includes(tool.id)
              ? 'translateY(0)'
              : 'translateY(20px)',
          }}
        >
          <div
            className={styles.toolIcon}
            dangerouslySetInnerHTML={{ __html: tool.icon }}
          />
          <h3 className={styles.toolTitle}>{tool.title}</h3>
          <p className={styles.toolDescription}>{tool.description}</p>
        </a>
      ))}
    </div>
  );
}