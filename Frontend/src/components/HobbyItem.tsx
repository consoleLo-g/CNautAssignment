import React, { useRef, useEffect } from 'react';
import { useDrag } from 'react-dnd';

interface HobbyItemProps {
  hobby: string;
}

const HobbyItem: React.FC<HobbyItemProps> = ({ hobby }) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'HOBBY', // Must match drop target
    item: { hobby },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  // Bind drag ref manually for TS compatibility
  useEffect(() => {
    if (ref.current) drag(ref.current);
  }, [drag]);

  return (
    <div
      ref={ref}
      style={{
        opacity: isDragging ? 0.5 : 1,
        padding: '4px 8px',
        marginBottom: 5,
        background: '#eee',
        borderRadius: 4,
        cursor: 'grab',
        userSelect: 'none',
      }}
    >
      {hobby}
    </div>
  );
};

export default HobbyItem;
