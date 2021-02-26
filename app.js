var budgetController = (function(){
    
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }
    
    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }else{
            this.percentage = -1;
        }
    }
    
    Expense.prototype.getPercentage = function(){
        return this.percentage;
    }
    
    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    }
    
    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });
        data.totals[type] = sum;
    };
    
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget : 0,
        percentage: -1  
    };
    
    return {
        addItem: function(type, des, val){
            var newItem, ID;
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            
            if(type === "exp"){
                newItem = new Expense(ID, des, val);
            } else {
                newItem = new Income(ID, des, val);
            }
            
            // push it into our data structure
            data.allItems[type].push(newItem);
            
            // return the new element
            return newItem;
        }, 
        
        deleteItem: function(type, id){
            var ids, index;
            
            ids = data.allItems[type].map(function(current){
                return current.id;  
            });
            
            index = ids.indexOf(id);
            
            if(index !== -1){
                data.allItems[type].splice(index, 1);
            }
        },
        
        calculateBudget: function(){
            // calculate total income and expense
            calculateTotal("exp");
            calculateTotal("inc");
            
            // calculate the budget: income - expense
            data.budget = data.totals.inc - data.totals.exp;
            
            // calculate the % of income we spent
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
            
        },
        
        calculatePercentages: function(){
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            });
        },
        
        getPercentage: function(){
            var allPercantage = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPercantage;
        },
        
        
        getBudget: function(){
          return {
              budget: data.budget,
              totalIncome: data.totals.inc,
              totalExpense: data.totals.exp,
              percentage: data.percentage
          };  
        },
        
        test:function(){
            console.log(data);
        }
    }
    
})();

var UIController = (function(){
    
    var str = {
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        inputBtn: ".add__btn",
        incomeContainer: ".income__list",
        expenseContainer: ".expenses__list",
        budgetLabel: ".budget__value",
        incomeLabel: ".budget__income--value",
        expenseLabel: ".budget__expenses--value",
        PercentageLabel: ".budget__expenses--percentage",
        container: ".container",
        expensePercentageLabel: ".item__percentage",
        dataLabel:".budget__title--month"
    };
    
    var nodeListForEach = function(list, callback){
                for(var i = 0; i < list.length; i++){
                    callback(list[i], i);
                }
    };
        
    return {
        getinput: function(){
            return{
                type : document.querySelector(str.inputType).value, // inc or exp
                description : document.querySelector(str.inputDescription).value,
                value : parseFloat(document.querySelector(str.inputValue).value)
            };
        },
        
        addListItem: function(obj, type){
            var html, newHtml, element;
            
            if(type === "inc"){
                element = str.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }else if(type === "exp"){
                element = str.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';     
            }
            
            newHtml = html.replace("%id%", obj.id);
            newHtml = newHtml.replace("%description%", obj.description);
            newHtml = newHtml.replace("%value%", this.formatNumber(obj.value, type));
            
            document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
        },
        
        deleteListItem: function(selectorID){
            var element = document.getElementById(selectorID);
            element.parentNode.removeChild(element);
        },
        
        clearFields: function(){
            var fields, fieldsArray;
            
            fields = document.querySelectorAll(str.inputDescription + ", " + str.inputValue);  
            fieldsArray = Array.prototype.slice.call(fields);
            
            fieldsArray.forEach(function(current, index, array){
                current.value = "";
            });
            
            fieldsArray[0].focus();
        },
        
        displayBudget: function(obj){
            var type;
            obj.budget > 0 ? type = "inc" : type = "exp";
            
            document.querySelector(str.budgetLabel).textContent = this.formatNumber(obj.budget, type);
            document.querySelector(str.incomeLabel).textContent = this.formatNumber(obj.totalIncome, "inc");
            document.querySelector(str.expenseLabel).textContent = this.formatNumber(obj.totalExpense, "exp");
            if(obj.percentage > 0){
                document.querySelector(str.PercentageLabel).textContent = obj.percentage + "%";
            }else{
                document.querySelector(str.PercentageLabel).textContent = "---";
            }
        },
        
        displayPercentages: function(percentages){
            var fields = document.querySelectorAll(str.expensePercentageLabel);
            
            
            
            nodeListForEach(fields, function(current, index){
                
                if(percentages[index] > 0){
                    current.textContent = percentages[index] + "%";
                } else {
                    current.textContent = "---"
                }
            });
        },
        
        displayMonth : function(){
            var now, year, month;
            
            var monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];
            
            now = new Date();
            
            year  = now.getFullYear();
            month = now.getMonth();
            document.querySelector(str.dataLabel).textContent = monthNames[month] + " " + year;
        },
        
        formatNumber: function(num, type){
            var numSplit, int, dec;
            
            num = Math.abs(num);
            num = num.toFixed(2);
            
            numSplit = num.split(".");
            
            int = numSplit[0];
            if(int.length > 3){
                int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3); 
            }
            
            dec = numSplit[1];
            
            return (type === "exp" ? "-" : "+") + " " + int + "." + dec;
        },
        
        
        
        changeType: function(){
            var fields = document.querySelectorAll(
                str.inputType + "," + 
                str.inputDescription + ","+
                str.inputValue
            );
            
            nodeListForEach(fields, function(cur){
                cur.classList.toggle("red-focus");
            });
            
            document.querySelector(str.inputBtn).classList.toggle("red");
        },
        
        getStr: function(){
            return str;
        }
    };
})();


var controller = (function(budgetCtrl, UICtrl){
    
    var setupEventListeners = function(){
        var str = UICtrl.getStr();
        document.querySelector(str.inputBtn).addEventListener("click", ctrlAddItem);
    
        document.addEventListener("keypress", function(event){
            if(event.keyCode === 13 || event.which === 13){
                ctrlAddItem();
            }
        });
        
        document.querySelector(str.container).addEventListener("click", ctrlDeleteItem);
        
        document.querySelector(str.inputType).addEventListener("change", UICtrl.changeType);
    };
    
    var updateBudget = function(){
        //1. calculate the budget
        budgetCtrl.calculateBudget();
        
        //2. return the budget
        var budget = budgetCtrl.getBudget();
        
        //3. display the budget on the UI
        UICtrl.displayBudget(budget);
    }
    
    var updatePercentage = function(){
        budgetCtrl.calculatePercentages();
        
        var percentages = budgetCtrl.getPercentage();
        
        UICtrl.displayPercentages(percentages);
        
    }
    
    var ctrlAddItem = function(){
        
        //1. get the field input data
        var input = UICtrl.getinput();
        
        if(input.description !== "" && !isNaN(input.value) && input.value > 0){
            //2. add the item to the budget controller
            var newItem = budgetCtrl.addItem(input.type, input.description, input.value);
        
            //3. add the item to the UI
            UICtrl.addListItem(newItem, input.type);
        
            //4. clear the fields
            UICtrl.clearFields();
        
            //5. calculate and update the budget
            updateBudget();
            
            updatePercentage();
        }
    };
    
    var ctrlDeleteItem = function(event){
        var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id; 
        if(itemID){
            splitID = itemID.split("-");
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            budgetCtrl.deleteItem(type,ID);
            
            UICtrl.deleteListItem(itemID);
            
            updateBudget();
            
            updatePercentage();
        }
    };
    
    
    return {
        init: function(){
            console.log("Application has started.");
            UICtrl.displayMonth();
            UICtrl.displayBudget({
              budget: 0,
              totalIncome: 0,
              totalExpense: 0,
              percentage: -1
          });
            setupEventListeners();
            
        }
    }
    
})(budgetController, UIController);

controller.init();