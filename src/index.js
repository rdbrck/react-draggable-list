import './draggableList.less'

const React = require('react')

const DEFAULT_DRAG_THRESHOLD = 10
const RESTRICT_DRAGGING = true
const MATCH_MOUSE_DOWN_BUTTON = 0

module.exports = React.createClass({
  displayName: 'DraggableList',
  propTypes: {
    onOrderChanged: React.PropTypes.func.isRequired,
    items: React.PropTypes.array.isRequired,
    dragStartThreshold: React.PropTypes.number,
    restrictDragging: React.PropTypes.bool,
    className: React.PropTypes.string,
    previewClassName: React.PropTypes.string,
    matchMouseDownButton: React.PropTypes.number
  },

  /* Parameters access */
  getDragThreshold () {
    return this.props.dragStartThreshold || DEFAULT_DRAG_THRESHOLD
  },
  getRestrictDragging () {
    return this.props.restrictDragging || RESTRICT_DRAGGING
  },
  getMatchMouseDownButton () {
    return this.props.matchMouseDownButton || MATCH_MOUSE_DOWN_BUTTON
  },

  /* Lifecycle */
  componentDidMount () {
    document.addEventListener('mouseup', this.onMouseUp)
    document.addEventListener('mousemove', this.onMouseMove)
  },
  componentWillUnmount () {
    document.removeEventListener('mouseup', this.onMouseUp)
    document.removeEventListener('mousemove', this.onMouseMove)
  },
  componentWillReceiveProps (nextProps) {
    if (this.state.isItemMoving) return

    let updateList = false
    if (this.props.items.length != nextProps.items.length) {
      updateList = true
    } else {
      for (let i = 0; i < this.props.items.length; i++) {
        if (this.props.items[i] != nextProps.items[i]) {
          updateList = true
          break
        }
      }
    }

    if (updateList) this.setState(this.getInitialState(nextProps))
  },

  /* Data lifecycle */
  getInitialState (props = this.props) {
    return {movingIndex: null, items: props.items, preventAnimation: false}
  },
  reorderList () {
    let item = this.state.items.splice(this.state.movingIndex, 1)[0]
    this.state.items.splice(this.state.movingItemPosition, 0, item)
    this.setState({items: this.state.items, preventAnimation: true})
    this.props.onOrderChanged(this.state.items.slice().map((item) => item.key))
  },
  cleanUpMovement () {
    this.setState({
      selectedIndex: null,
      isItemMoving: false,
      movingIndex: null,
      initialMouseY: null,
      previewTop: null,
      movingItemPosition: null,
      mouseDown: undefined
    })
  },

  /* User interaction */
  onMouseDown (evt, index) {
    /* Apply mouse down button constraint, if applicable */
    if (evt && evt.nativeEvent && this.getMatchMouseDownButton() >= 0 && this.getMatchMouseDownButton() != evt.nativeEvent.button) return

    this.setState({mouseDown: true, selectedIndex: index})
    this.measureDimensions()
  },
  onMouseUp () {
    if (this.state.movingItemPosition != null && this.state.movingIndex != null && this.state.movingItemPosition != this.state.movingIndex) {
      this.reorderList()
    } else {
      this.setState({items: this.props.items})
    }
    this.cleanUpMovement()
  },
  onMouseMove (evt) {
    /* Only handle mouse move if mousedown was triggered on a list element */
    if (!this.state.mouseDown) return

    /* If initial mouse position was not saved, save it and return. We need this for calculating mouseDiff */
    let currentMouseY = evt.screenY
    if (!this.state.initialMouseY) {
      this.setState({initialMouseY: currentMouseY})
      return
    }

    /* Calculate Y distance in pixels from the current mouse position to the initial mouse position */
    let mouseYDiff = this.state.initialMouseY - currentMouseY

    /* Only consider actual movement if difference is greater than the drag threshold */
    if (Math.abs(mouseYDiff) >= this.getDragThreshold()) {
      this.setState({isItemMoving: true})
    }

    /* Only handle actual item movement from now on */
    if (!this.state.isItemMoving) return

    /* Calculate moving item top based on mouse position */
    let root = this.refs.listRoot
    let rootRect = root.getBoundingClientRect()
    this.setState({
      movingIndex: this.state.selectedIndex,
      preventAnimation: false,
      previewTop: this.state.itemsTop[this.state.selectedIndex] - rootRect.top
    })

    /* Only continue if movingIndex indicates item that is moving */
    if (this.state.movingIndex == null) return

    /* Apply dragging restrictions, if applicable */
    let previewTop = this.state.itemsTop[this.state.selectedIndex] - (mouseYDiff != null ? mouseYDiff : 0)
    if (this.getRestrictDragging()) {
      previewTop = previewTop < 0 ? 0 : previewTop
      let maxTop = rootRect.height - this.refs['selectedItem' + this.state.selectedIndex].getBoundingClientRect().height
      previewTop = previewTop > maxTop ? maxTop : previewTop
    }
    this.setState({previewTop: previewTop})

    /* Find current position in the list */
    let movingItemPosition = 0
    for (let i = 0; i < this.state.items.length; i++) {
      let selectedItemTop = this.state.itemsTop[i]
      let selectedItemThreshold = this.state.itemsThreshold[i]
      if (previewTop > selectedItemTop + selectedItemThreshold) movingItemPosition++
    }
    this.setState({movingItemPosition: movingItemPosition})
  },
  measureDimensions () {
    let itemsTop = []
    let itemsThreshold = []
    let rootMeasures = this.refs.listRoot.getBoundingClientRect()

    /* Calculate top and `swap` threshold for each element in the list */
    this.state.items.forEach((item, index) => {
      let itemMeasures = this.refs['selectedItem' + index].getBoundingClientRect()
      itemsTop.push(itemMeasures.top - rootMeasures.top)
      itemsThreshold.push(itemMeasures.height / 2)
    })

    this.setState({itemsTop: itemsTop, itemsThreshold: itemsThreshold})
  },

  /* Rendering */
  render () {
    const {movingIndex, items, movingItemPosition, preventAnimation, previewTop} = this.state
    const {className, previewClassName} = this.props

    return (
      <div className={`dynamic-list-root ${className || ''}`} ref='listRoot'>
        {items.map((item, index) => {
          let moveUp = movingItemPosition != null && (movingItemPosition > movingIndex && index <= movingItemPosition && index > movingIndex)
          let moveDown = movingItemPosition != null && (movingItemPosition < movingIndex && index >= movingItemPosition && index < movingIndex)
          return (
            <div
              className={`dynamic-list-item ${movingIndex == index ? 'selected' : ''} ${moveUp ? 'move-up' : ''} ${moveDown ? 'move-down' : ''}`}
              style={preventAnimation ? {transition: 'none'} : {}}
              ref={'selectedItem' + index}
              key={item.key}
              onMouseDown={(evt) => {
                this.onMouseDown(evt, index)
              }}>
              {item}
            </div>
          )
        })}

        {movingIndex != null && previewTop >= 0 &&
        <div className={`dynamic-list-item-preview ${previewClassName || ''}`} style={{top: previewTop}}>
          {items[movingIndex]}
        </div>
        }
      </div>
    )
  }
})
