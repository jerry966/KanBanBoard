import React from 'react';
import Issue from './Issue';
import { DroppableProvided, Draggable, DraggableProvided } from 'react-beautiful-dnd';

interface IssueType {
  id: number;
  title: string;
  description?: string;
}

interface ColumnProps {
  title: string;
  issues: IssueType[];
  provided: DroppableProvided;
}

const Column: React.FC<ColumnProps> = ({ title, issues, provided }) => {
  return (
    <div className="kanban-column" ref={provided.innerRef} {...provided.droppableProps}>
      <h3>{title}</h3>
      <div className="issues-list">
        {issues.map((issue, idx) => (
          <Draggable key={issue.id} draggableId={issue.id.toString()} index={idx}>
            {(providedDraggable: DraggableProvided) => (
              <div
                ref={providedDraggable.innerRef}
                {...providedDraggable.draggableProps}
                {...providedDraggable.dragHandleProps}
              >
                <Issue title={issue.title} description={issue.description} />
              </div>
            )}
          </Draggable>
        ))}
        {provided.placeholder}
      </div>
    </div>
  );
};

export default Column;
