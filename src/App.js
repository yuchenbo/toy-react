import { ToyReact, Component } from './ToyReact';

class MyComponent extends Component {
    render() {
        return (
            <div name='嵌套内层组件'>
                <div>内层组件渲染节点</div>
                <div>{this.children}</div>
                <div>{true}</div>
            </div>
        )
    }
}

// class MyComponent extends Component {
//     render() {
//         return (
//             <div name='嵌套内层组件'></div>
//         )
//     }
// }


const App = <MyComponent />
// const App = <div name='ycb'>内层组件渲染节点</div>
// const App = (
//     <div>
//         内层组件渲染节点
//         <span>jsx0</span>
//         <span>jsx1</span>
//         <span>jsx2</span>
//     </div>
// )
/*
const App = (
    <div>
        <span>jsx0</span>
        <span>jsx1</span>
        <span>jsx2</span>
    </div>
)
const App = <MyComponent/>
const App = (
    <MyComponent>
        <p>自定义组件内部</p>
    </MyComponent>
)*/

export default App;