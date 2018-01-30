# react-draggable-list
A draggable React vertical list component

## Development

```
npm install
npm start
```

## Example

Coming soon...

## Install

```
npm install git+https://github.com/rdbrck/react-draggable-list.git
```

## Usage

```js
const React = require('react')
const DraggableList = require('react-draggable-list')

getInitialState () {
  return {itemsArray: [
    <div key="0">ITEM 0</div>,
    <div key="1">ITEM 1</div>,
    <div key="2">ITEM 2</div>
    ]}
},

// After the order has changed, DraggableList will retain the new order unless new props are passed
handleOnOrderChange (newOrder) {
  let orderedItemsArray = [];
  newOrder.forEach((key) => {
    orderedItemsArray.push(itemsArray.find((item) => item.key == key))
  })
  this.setState({ itemsArray: orderedItemsArray })
},

render () {
  return (
    <DraggableList items={itemsArray} onOrderChange={handleOnOrderChange}/>
  )
}
```

### props

Name                 | Type   | Required | Default | Description
-------------------- | -------| -------- | ------- | -------------------------------------------------------------
**onOrderChanged**   | func   | Yes      |         | This function is called after the items order has been changed
**items**            | array  | Yes      |         | Array of React components used as list items
dragStartThreshold   | number | No       | 10      | Minimum mouse movement (in pixels) to start dragging <sup>1</sup>
restrictDragging     | bool   | No       | true    | Restrict dragging to top and bottom borders
className            | string | No       |         | Class name to be applied to the root element
previewClassName     | string | No       |         | Class name to be applied to a dragging element
matchMouseDownButton | number | No       | 0       | Restrict drag to specific mouse button <sup>2</sup>

Footnotes:<br />
1 - Setting this property to zero might cause unwanted behavior like blocking inner click events and more;<br />
2 - For mouse button event refer to https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button.

## Tests

Coming soon...

## License

**react-draggable-list** is released under the MIT license: https://opensource.org/licenses/MIT.
