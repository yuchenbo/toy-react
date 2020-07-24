class Wrapper {
    constructor(type) {
        this.ele = document.createElement(type)
    }

    mountTo(parent) {
        parent.appendChild(this.ele)
    }

    setAttribute(name, value) {
        this.ele.setAttribute(name, value)
    }

    appendChild(vchild) {
        vchild.mountTo(this.ele);
    }
}

// Component类是用于自定义组件时调用的
export class Component {
    constructor() {
        this.children = [];
    }
    mountTo(parent) {
        let vdom = this.render();
        /*
        这里的this指的是MyComponent, this.render()返回的是
       <div name='嵌套内层组件'>
            <div>内层组件渲染节点</div>
            <div>{this.children}</div>
            <div>{true}</div>
        </div>
        */
        vdom.mountTo(parent);
    }
    setAttribute(name,value) {
        this[name] = value;
    }
}

class TextWrapper {
    constructor(content) {
        this.content = document.createTextNode(content)
    }
    mountTo(parent) {
        parent.appendChild(this.content);
    }
}

export const ToyReact = {
    /*
        @babel/plugin-transform-react-jsx
        In: const profile = (
              <div>
                <img src="avatar.png" className="profile" />
                <h3>{[user.firstName, user.lastName].join(' ')}</h3>
              </div>
            );
         Out: const profile = React.createElement("div", null,
              React.createElement("img", { src: "avatar.png", className: "profile" }),
              React.createElement("h3", null, [user.firstName, user.lastName].join(" "))
            );
     */
    createElement(type, attributes, ...children) {
        console.log(arguments, 'arguments')
        console.log(type, 'type')
        let element

        if (typeof type === "string") {
            element =  new Wrapper(type);
        }

        if (typeof type === "function") {
            element = new type;
        }

        for (let name in attributes) {
            element.setAttribute(name, attributes[name]);
        }

        console.log(children, 'children')

        let instertChildren = (children) => {
            for (let child of children) {

                if (typeof child === "object" && child instanceof Array) {
                    instertChildren(child);
                } else {
                    // 看打印出的arguments，就知道要去除多余的子元素对象
                    if (!(child instanceof Component) && !(child instanceof Wrapper) && !(child instanceof TextWrapper)) {
                        child = String(child)
                    }

                    if (typeof child === "string") {
                        child = new TextWrapper(child);
                    }
                    element.appendChild(child);
                }

                console.log(element, 'element')
            }
        }

        instertChildren(children);

        return element;
    },
    render(vdom, parent) {
        // vdom 为createElement函数的返回值，原始值为一组DOM，但是需要在vdom下有mountTo的挂载的方法，那就需要对vdom包装成对象，
        // 即在Wrapper下需要有mountTo的挂载方法
        vdom.mountTo(parent);
    }
}