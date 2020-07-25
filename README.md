## ToyReact
#### setState实现部分
##### 核心是使用了 document.createRange()，实现局部DOM刷新

注意setState的再次render的过程是需要先清除对应的DOM区域，再render,即先
deleteContents再render 

[range的API链接](https://developer.mozilla.org/zh-CN/docs/Web/API/Range)

