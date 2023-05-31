const Item = function(name){
    this.name = name;
    this.children = [];
    this.parent = null;
};

Item.prototype.addChild = function(element){
    element.parent = this;
    this.children.push(element);
};

class DataProvider {
    constructor(data) {
        this.fruits = data || [];
        
        this.rebuild();
    }
    
    rebuild() {
        let rootItems = [];
        
        this.fruits.forEach((f) => {
            console.log(f);
            let element = new Item(f.label);
            element.image = f.image;
            //element.path = `Images/icons/${f.image || 'default'}.png`
            f.list.forEach((item)=>{
                console.log(JSON.stringify(item));
                let listItem = new Item(
                    item.duration?`${item.title} (${item.duration} ms)`:item.title
                );
                //i.path = `icons/${f.image || 'default'}.png`
                element.addChild(listItem);
            });
            
            rootItems.push(element);
        });
        
        this.rootItems = rootItems;
    }
    
    getChildren(element) {
        // Requests the children of an element
        if (!element) {
            return this.rootItems;
        }
        else {
            return element.children;
        }
    }
    
    getParent(element) {
        // Requests the parent of an element, for use with the reveal() method
        return element.parent;
    }
    
    getTreeItem(element) {
        // Converts an element into its display (TreeItem) representation
        let item = new TreeItem(element.name);
        if (element.children.length > 0) {
            item.collapsibleState = TreeItemCollapsibleState.Collapsed;
            //item.image = "__filetype.sh";
            item.contextValue = "test";
        }
        else {
            //item.image = "__filetype.txt";
            //item.command = "mochasidebar.doubleClick";
            item.contextValue = "describe";
        }
        if(element.image){
            console.log(element.path);
            item.image = element.image;
        } 
        return item;
    }
}

module.exports = {
    Item,
    DataProvider
};