
interface propsInterface {
    item: {
        title: string,
        description: string
        id: number,
        done: boolean
    },
    handleDelete(toDelete: number): void,
    handleChange(toDelete: number): void
}

function TodoCart (props: propsInterface) {

    return <div className={props.item.done? 'todo--completed' : 'todo--not_completed' }>
                <p className="item__title"> {props.item.title}</p>
                <p className="item__description"> {props.item.description}</p>
                <button className="todo--toggle-completed" onClick={(e)=>{props.handleChange(props.item.id)}}> {props.item.done? 'Mark as undone' : 'Mark as done'}</button>
                {props.item.done? <button className='todo__button--remove' onClick={(e) => {e.stopPropagation(); props.handleDelete(props.item.id)}}> Remove </button> : null}
            </div>
}

export default TodoCart;