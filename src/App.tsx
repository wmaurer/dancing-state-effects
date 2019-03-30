import React, { FC, useState, useCallback } from 'react';

type ItemData = { id: number; name: string };

const itemData: ItemData[] = [
    { id: 1, name: 'Milk Chocolate' },
    { id: 2, name: 'Dark Chocolate' },
    { id: 3, name: 'White Chocolate' },
    { id: 4, name: 'Raw Chocolate' },
    { id: 5, name: 'Chocolate Milk' },
];

let lastColor: string;

function generateNewColor() {
    lastColor = 'rgba(' + Math.random() * 255 + ',' + Math.random() * 255 + ',' + Math.random() * 255 + ',1)';
}

const Row = React.memo<{ item: ItemData; editing: boolean; onEdit: (id: number) => void }>(
    ({ item, editing, onEdit }) => {
        return (
            <div
                style={{
                    borderBottom: '1px solid #f0f0f0',
                    padding: 10,
                    display: 'flex',
                }}
                onClick={() => onEdit(item.id)}
            >
                <div style={{ flex: 1 }}>{editing ? <input defaultValue={item.name} /> : item.name}</div>
                <div style={{ backgroundColor: lastColor, width: 25, height: 25 }} />
            </div>
        );
    },
);

function App() {
    let [items] = useState(itemData);
    let [editingId, setEditingId] = useState<number | null>(null);

    generateNewColor();

    const onEdit = useCallback((id: number) => {
        setEditingId(id);
    }, []);

    return (
        <div>
            {items.map(item => (
                <Row key={item.id} item={item} editing={editingId === item.id} onEdit={onEdit} />
            ))}
        </div>
    );
}

export default App;
