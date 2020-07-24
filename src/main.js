import { ToyReact } from './ToyReact';
import App from './App';

ToyReact.render(
    App,  // 如果写成<App />, createElement会执行两次，具体看输出的arguments的type，一次是<APP />本身，一次是组件里面的div
    document.getElementById('root')
);