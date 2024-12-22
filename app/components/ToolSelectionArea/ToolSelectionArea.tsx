import { useState, useEffect } from 'react';
import styles from './ToolSelectionArea.module.css';
import { useAuth } from '../../context/AuthContext';
import type { Tool } from '../../vistypes';
import { NavLink, useNavigate } from 'react-router';


const tools: Tool[] = [
  {
    id: 'inventory',
    title: 'Inventory Manager',
    description: 'Track and manage your inventory.',
    baseUrl: '/inventory/',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
    </svg>`,
  },
  {
    id: 'formulacreator',
    title: 'Formula Creator',
    description: 'Create and manage formulas.',
    baseUrl: '/formulacreator/',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
    </svg>`,
  }
];

export default function ToolSelectionArea() {
  const { user } = useAuth();
  const [visibleTools, setVisibleTools] = useState<string[]>([]);

  const navigate = useNavigate();

  const handleNavigation = (newRoute: string) => {
    navigate(newRoute);
  };

  useEffect(() => {
    const showTools = async () => {
      for (const tool of tools) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setVisibleTools(prev => [...prev, tool.id]);
      }
    };

    showTools();
  }, []);

  return (
    <div className={styles.toolGrid}>
      {tools.map((tool, t) => (
        <NavLink
          viewTransition
          role='button'
          key={tool.id}
          to={tool.baseUrl}
          // onClick={() => handleNavigation(tool.baseUrl)}
          className={styles.toolCard}
          style={{
            opacity: visibleTools.includes(tool.id) ? 1 : 0,
            transform: visibleTools.includes(tool.id)
              ? 'translateY(0)'
              : 'translateY(1.5rem)',
          }}
        >
          <div
            className={styles.toolIcon}
            dangerouslySetInnerHTML={{ __html: tool.icon }}
          />
          {<h3 className={styles.toolTitle}>{tool.title}</h3>}
          {/* <p className={styles.toolDescription}>{tool.description}</p> */}
        </NavLink>
      ))}
    </div>
  );
}