import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Maximize2, MoveVertical, GripHorizontal } from 'lucide-react';
import { Button } from 'react-bootstrap';

export function SortableItem(props) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: props.id });

    const [isHovered, setIsHovered] = useState(false);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        touchAction: 'none',
        marginBottom: '1.5rem',
        position: 'relative',
        height: props.height || '100%', // Apply dynamic height
        zIndex: isDragging ? 999 : (isHovered ? 10 : 'auto'),
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="h-100"
        >
            {/* Resize Control - Visible on Hover */}
            <div
                style={{
                    position: 'absolute',
                    top: '-12px',
                    right: '10px',
                    zIndex: 20,
                    opacity: isHovered || isDragging ? 1 : 0,
                    transition: 'opacity 0.2s',
                    display: 'flex',
                    gap: '5px'
                }}
            >
                {/* Drag Handle */}
                <div
                    className="bg-white rounded-pill shadow-sm px-2 py-1 d-flex align-items-center text-muted"
                    style={{ cursor: 'grab', fontSize: '10px' }}
                    {...attributes}
                    {...listeners}
                >
                    <GripHorizontal size={14} />
                </div>

                {/* Width Resize Button */}
                {props.onResize && (
                    <Button
                        variant="light"
                        size="sm"
                        className="rounded-circle shadow-sm border-0 d-flex align-items-center justify-content-center"
                        style={{ width: '28px', height: '28px', padding: 0 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            props.onResize();
                        }}
                        title="Resize Width"
                    >
                        <Maximize2 size={14} className="text-secondary" />
                    </Button>
                )}

                {/* Height Resize Button */}
                {props.onResizeHeight && (
                    <Button
                        variant="light"
                        size="sm"
                        className="rounded-circle shadow-sm border-0 d-flex align-items-center justify-content-center"
                        style={{ width: '28px', height: '28px', padding: 0 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            props.onResizeHeight();
                        }}
                        title="Resize Height"
                    >
                        <MoveVertical size={14} className="text-secondary" />
                    </Button>
                )}
            </div>

            <div className="h-100" style={{ overflowY: 'auto', overflowX: 'hidden' }} {...attributes} {...listeners}>
                {/* Added overflow-auto to respect fixed height with scroll */}
                {props.children}
            </div>
        </div>
    );
}
