import React, { useCallback, useReducer } from 'react';
import { unionize, ofType, UnionOf } from 'unionize';
import { Option, some, none } from 'fp-ts/lib/Option';
import { useObservable, useEventCallback } from 'rxjs-hooks';
import { withLatestFrom, map, tap } from 'rxjs/operators';

type ItemData = { id: number; name: string };

const itemData: ItemData[] = [
    { id: 1, name: 'Milk Chocolate' },
    { id: 2, name: 'Dark Chocolate' },
    { id: 3, name: 'White Chocolate' },
    { id: 4, name: 'Raw Chocolate' },
    { id: 5, name: 'Chocolate Milk' },
];

let lastColor: string;

const generateNewColor = () =>
    (lastColor = 'rgba(' + Math.random() * 255 + ',' + Math.random() * 255 + ',' + Math.random() * 255 + ',1)');

const ChangedIndicator = () => <div style={{ backgroundColor: lastColor, width: 25, height: 25 }} />;

const Row = React.memo<{
    item: ItemData;
    editing: boolean;
    onEdit: (id: number) => void;
    onSave: (item: ItemData) => void;
}>(({ item, editing, onEdit, onSave }) => {
    return (
        <div
            style={{
                borderBottom: '1px solid #f0f0f0',
                padding: 10,
                display: 'flex',
            }}
            onClick={() => onEdit(item.id)}
        >
            <div style={{ flex: 1 }}>
                {editing ? (
                    <input
                        defaultValue={item.name}
                        style={editing ? undefined : { width: 0, opacity: 0 }}
                        onBlur={e => {
                            onSave({ ...item, name: e.target.value });
                        }}
                    />
                ) : (
                    item.name
                )}
            </div>
            <ChangedIndicator />
        </div>
    );
});

type State = {
    items: ItemData[];
    editingId: Option<number>;
};

const Action = unionize({ saveItem: ofType<ItemData>(), editItem: ofType<number>() }, { value: 'payload' });
export type Action = UnionOf<typeof Action>;

const reducer = (state: State, action: Action): State =>
    Action.match({
        saveItem: item => ({ ...state, items: state.items.map(it => (it.id === item.id ? item : it)) }),
        editItem: id => ({ ...state, editingId: some(id) }),
    })(action);

const App = () => {
    const [dispatch, state] = useEventCallback<Action, State>(
        (event$, state$) => {
            console.log('here');
            return event$.pipe(
                tap(e => console.log(e)),
                withLatestFrom(state$),
                map(([action, state]) => reducer(state, action)),
            );
        },
        {
            items: itemData,
            editingId: none,
        },
    );
    // const state = useObservable((state$) => )

    // const [state, dispatch] = useReducer(reducer, {
    //     items: itemData,
    //     editingId: none,
    // });

    generateNewColor();

    const onEdit = useCallback((id: number) => dispatch(Action.editItem(id)), [dispatch]);
    const onSave = useCallback((item: ItemData) => dispatch(Action.saveItem(item)), [dispatch]);

    return (
        <div>
            {state.items.map(item => (
                <Row
                    key={item.id}
                    item={item}
                    editing={state.editingId.fold(false, id => id === item.id)}
                    onEdit={onEdit}
                    onSave={onSave}
                />
            ))}
        </div>
    );
};

export default App;
