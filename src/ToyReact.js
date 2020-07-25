class Wrapper {
    constructor(type) {
        this.ele = document.createElement(type);
    }

    mountTo(range) {
        range.deleteContents();
        range.insertNode(this.ele);
    }

    setAttribute(name, value) {
        if (name.match(/^on([\s\S]+)$/)) {
            let eventName = RegExp.$1.replace(/^[\s\S]/, s => s.toLowerCase());
            this.ele.addEventListener(eventName, value);  // 此时传进来value的是一个方法
        }
        if (name === "className") {
            name = "class";
        }
        this.ele.setAttribute(name, value);
    }

    appendChild(vchild) {
        let range = document.createRange();
        if (this.ele.children.length) {
            range.setStartAfter(this.ele.lastChild);
            range.setEndAfter(this.ele.lastChild);
        } else {
            range.setStart(this.ele, 0);
            range.setEnd(this.ele, 0);
        }
        vchild.mountTo(range);
    }
}

// Component类是用于自定义组件时调用的
export class Component {
    constructor() {
        this.props = Object.create(null);
        this.children = [];
    }
    mountTo(range) {
        this.range = range;
        this.update();
    }
    update() {
        // 解决range 中的节点由于deleteContents造成的startOffset和endOffset位置错乱的问题，加入了一个占位符
        let placeholder = document.createComment("placeHolder");
        let range = document.createRange();
        range.setStart(this.range.endContainer, this.range.endOffset);
        range.setEnd(this.range.endContainer, this.range.endOffset);
        range.insertNode(placeholder);

        this.range.deleteContents();
        let vdom = this.render();
        vdom.mountTo(this.range);
    }
    setAttribute(name,value) {
        this[name] = value;
        this.props[name] = value;
    }

    setState(state) {
        let merge = (oldState, newState) => {
           for (let p in newState) {
               if (typeof newState[p] === "object" && typeof newState[p] !== null) {
                    if (typeof oldState[p] !== "object") {
                        if (newState[p] instanceof Array) {
                            oldState[p] = [];
                        } else {
                            oldState[p] = {};
                        }
                    }
                    merge(oldState[p], newState[p])
               } else {
                   oldState[p] = newState[p];
               }
           }
        }

        if (!this.state && state) {
            this.state = {};
        }
        merge(this.state, state);
        this.update(); // setState的再次render的过程
    }
}

class TextWrapper {
    constructor(content) {
        this.content = document.createTextNode(content)
    }
    mountTo(range) {
        range.deleteContents();
        range.insertNode(this.content);
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
        let range = document.createRange();
        if (parent.children.length) {
            range.setStartAfter(parent.lastChild);
            range.setEndAfter(parent.lastChild);
        } else {
            range.setStart(parent, 0);
            range.setEnd(parent, 0);
        }
        vdom.mountTo(range);
    }
}