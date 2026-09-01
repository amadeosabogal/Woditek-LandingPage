import React, { useState, useEffect, useRef } from 'react';
import { userService } from '../../../services/userService';

export interface User {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
}

interface UserSelectorProps {
  selectedUserId?: number;
  onSelect: (userId: number) => void;
  className?: string;
  usersList?: User[];
}

const UserSelector: React.FC<UserSelectorProps> = ({ selectedUserId, onSelect, className = '', usersList }) => {
  const [users, setUsers] = useState<User[]>(usersList || []);
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<'left' | 'right'>('left');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (usersList) {
      setUsers(usersList);
    } else {
      loadUsers();
    }
    
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [usersList]);

  const loadUsers = async () => {
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggle = () => {
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      // If there's less than 200px on the left but space on right, align left (expand right)
      // Otherwise if close to right edge, align right (expand left)
      if (rect.left < 200) {
        setDropdownPos('left');
      } else if (window.innerWidth - rect.right < 200) {
        setDropdownPos('right');
      } else {
        setDropdownPos('left');
      }
    }
    setIsOpen(!isOpen);
  };

  const selectedUser = users.find(u => u.id === selectedUserId);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button 
        type="button"
        onClick={handleToggle}
        className="w-8 h-8 rounded bg-primary text-white flex items-center justify-center font-bold text-[12px] uppercase shadow-sm hover:scale-110 transition-transform"
        title={selectedUser ? `${selectedUser.nombre} ${selectedUser.apellido}` : "Seleccionar responsable"}
      >
        {selectedUser?.nombre?.charAt(0) || '?'}
      </button>
      
      {isOpen && (
        <div 
          className={`absolute top-full mt-2 w-48 bg-surface border border-border-subtle rounded-lg shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100 max-h-48 overflow-y-auto ${dropdownPos === 'left' ? 'left-0' : 'right-0'}`}
        >
          {users.map(user => (
            <button
              key={user.id}
              type="button"
              className="w-full text-left px-3 py-2 text-[12px] hover:bg-surface-muted transition-colors flex items-center gap-2"
              onClick={() => {
                onSelect(user.id);
                setIsOpen(false);
              }}
            >
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px] uppercase">
                {user.nombre?.charAt(0)}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-on-surface leading-tight">{user.nombre} {user.apellido}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserSelector;
