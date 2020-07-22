class Wrapper {
    constructor(type) {
        console.log(type, 'type')
        this.ele = document.createElement(type)
    }

    mountTo(parent) {
        parent.appendChild(this.ele)
    }

    setAttribute(name, value) {
        this.ele.setAttribute(name, value)
    }
}


export class Component {
    // mountTo(parent) {
    //     debugger
    //     vdom.mountTo(parent);
    // }
    // mountTo(parent) {
    //     let vdom = this.render();
    //     vdom.mountTo(parent);
    // }
    // setAttribute(name,value) {
    //     this[name] = value;
    // }

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
        debugger
        console.log(arguments, 'arguments')
        let element = document.createElement(type)

        // if (typeof type === "string") {
        //     debugger
        //     element =  new Wrapper(type);
        // } else {
        //     debugger
        //     // element = new type;
        // }
        for (let name in attributes) {
            element.setAttribute(name, attributes[name]);
        }
        return element;
    },
    render(vdom, parent) {
        // vdom 为createElement函数的返回值，原始值为一组DOM，但是需要在vdom下有mountTo的挂载的方法，那就需要对vdom包装成对象，
        // 即在Wrapper下需要有mountTo的挂载方法
        debugger
        vdom.mountTo(parent);  // mountTo
    }
}