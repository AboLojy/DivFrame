class HTMLDivFrame extends HTMLElement {

        functionsInsideFram = [];
        public shadow: ShadowRoot;
        get src() {
            return this.getAttribute('src');
        }
        set src(val) {
            if (val) {
                this.setAttribute('src', val);
                this.goTo(this.attributes["src"].value);
            }
        }
        location: HTMLDivFrame;
        constructor() {
            super();
            this.location = this;
        }

    
    
        replace(url) {
            this.goTo(url);
        }
        connectedCallback() {
            this.goTo(this.attributes["src"].value);
        }

        isScriptAlreadyIncluded(src) {
            var scripts = document.getElementsByTagName("script");
            for (var i = 0; i < scripts.length; i++)
                if (scripts[i].getAttribute('src') == src) return true;
            return false;
        }
        isCssFileAlreadyIncluded(src) {
            var scripts = document.getElementsByTagName("link");
            for (var i = 0; i < scripts.length; i++)
                if (scripts[i].getAttribute('href') == src) return true;
            return false;
        }

         goTo(url) {
            var req= new XMLHttpRequest();

            
    
                req.open('GET', url, false);
                req.send(null);
                const el = document.createElement("html");

                this.innerHTML = "";
            
                el.innerHTML = req.responseText;
                const body = el.getElementsByTagName("body")[0];
                const head = el.getElementsByTagName("head")[0];
        
                let linkedScripts = Array.prototype.slice.call(el.querySelectorAll("script[src]"));
                let scripts = linkedScripts.concat(Array.prototype.slice.call(el.querySelectorAll("script:not([src])")));

                var div = document.createElement("div");
                div.className = "div-fram body";
                div.innerHTML = body.innerHTML;
    
                const styles = el.getElementsByTagName("style");
                while (styles.length > 0)
                    this.appendChild(styles[styles.length - 1]);
    
                const links = el.getElementsByTagName("link");
                while (links.length > 0)
                    this.appendChild(links[links.length - 1]);
    
                var frameName = this.attributes["name"] ? this.attributes["name"].value : `fram${Math.floor(1000 + Math.random() * 9000)}`;
                var funcNamesRgx = new RegExp(`function[\\s\\S](?!${frameName})(.*)(\\(.*)`, "g"); //g;
    
    
    
                var funRename = "";
                var funRefRenamed = "";
                for (let j = 0; j < scripts.length; j++) {
                    let temp = document.createElement("script");
    
                    if (scripts[j].innerHTML === "") {
                        temp.setAttribute("src", scripts[j].attributes["src"] ? scripts[j].attributes["src"].value : "");
                        temp.setAttribute("type", scripts[j].attributes["type"] ? scripts[j].attributes["type"].value : "");
                        if (false == this.isScriptAlreadyIncluded(scripts[j].attributes["src"].value))
                            document.head.appendChild(temp.cloneNode(true));
                        continue;
    
                    }
                    funRename = scripts[j].textContent .replace(funcNamesRgx, (match, g1, g2) => {
                        this.functionsInsideFram.push(g1);
                        return `function ${frameName + g1 + g2}`;
                    });
    
                    funRefRenamed = this.hasAttribute("force-onload") ? 
                        frameName + body.attributes["onload"].value + scripts[j].textContent  :
                        scripts[j].textContent ;
                    for (let i = 0; i < this.functionsInsideFram.length; i++) {

                        let funcUsedRefs = new RegExp(`(?<=[^\\.])([^\\.\\w\\\s\\(\\+\\,\\!]*\\b${this.functionsInsideFram[i]}\\b[^\\.])`, "gm");
                        funRefRenamed = funRefRenamed.replace(funcUsedRefs, (match, g1, g2) => {
                            return ` ${frameName + g1.trim()}`;
                        });
                    }
                    if (this.hasAttribute("friends")) {
                        let friendsValue = this.getAttribute("friends");
                        let friends = friendsValue.split(",");
                        for (let k = 0; k < friends.length; k++) {
                            funRefRenamed = funRefRenamed.replace(new RegExp(`(parent\\.|top\\.)(${friends[k].trim()})\\.((?!src|location)[\\w]+[^\\.][\\(])`, "gmi"), "$1$2.$2$3");
                            if (!window[friends[k]])
                                window[friends[k]] = {};
                        }
    
                    }
    
                    temp.textContent  = funRefRenamed;
                    temp.setAttribute("defer", "");
    
                    this.appendChild(temp.cloneNode(true));
                }
    

    
                funRefRenamed = div.innerHTML;
                for (let i = 0; i < this.functionsInsideFram.length; i++) {
                    let funcUsedRefs = new RegExp(`([^\\w])(${this.functionsInsideFram[i]})`, "gm");//new RegExp(`(?!([\\"\\:\\s]))(${this.functionsInsideFram[i]})(\\([\\w]\\))`, "gmi");//new RegExp(`(.*[\\.\\s\\:\\"]*)(${this.functionsInsideFram[i]})(\\(*.*)`,"g");
                    funRefRenamed = funRefRenamed.replace(funcUsedRefs, `$1${frameName}$2`);            }
                div.innerHTML = funRefRenamed;
                this.appendChild(div);
            
                if (body.attributes["onload"]) {
                    body.attributes["onload"].value = `${frameName + body.attributes["onload"].value}`;
                }
                window[frameName] = this as any;
    
                let pid = setInterval(() => {
                    if (this.ownerDocument.readyState === 'complete') {
                        clearInterval(pid);
                        for (let i = 0; i < this.functionsInsideFram.length; i++) {
                            if (window[`${frameName}${this.functionsInsideFram[i]}`])
                                this[`${frameName}${this.functionsInsideFram[i]}`] = window[`${frameName}${this.functionsInsideFram[i]}`];
                        }

                    }
                }, 100);
            
    
           
        }
    
    
    }
    
    customElements.define('div-frame', HTMLDivFrame);