import { useDrag, useDrop } from "react-dnd";

export default function useDraggableItem({
  index,
  moveItem,
  isEditing = true,
  item,
  renderContent,
  itemType = "DraggableItem",
}) {
  const [{ isDragging }, drag] = useDrag({
    type: itemType,
    item: { index },
    canDrag: isEditing,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: itemType,
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveItem(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`relative ${isDragging ? "opacity-50" : "opacity-100"}`}
      style={{ cursor: isEditing ? "move" : "default" }}
    >
      {renderContent(item)}
    </div>
  );
}
