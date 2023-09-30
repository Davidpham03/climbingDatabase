    const firebaseConfig = {
        apiKey: "AIzaSyBLQMCf5qIGZ_N7be6gbhCOQ95MtbJ49D8",
        authDomain: "climbingdatabase-2123b.firebaseapp.com",
        databaseURL: "https://climbingdatabase-2123b-default-rtdb.europe-west1.firebasedatabase.app",
        projectId: "climbingdatabase-2123b",
        storageBucket: "climbingdatabase-2123b.appspot.com",
        messagingSenderId: "606488214041",
        appId: "1:606488214041:web:46dff61dddf9a36a6a4888",
        measurementId: "G-JCP6DJ2QCY"
   };

    firebase.initializeApp(firebaseConfig);
    const database = firebase.firestore();

    class Wall{
        constructor (name){
            this.name = name;
        }
    }

    class Node{
        constructor (x, y, id, coordsX=[], coordsY=[]){
            this.x = x;
            this.y = y;
            this.id = id;
            this.coordsX = coordsX;
            this.coordsY = coordsY;
        }
    }

    class Route{
        constructor(name , difficulty, routeNodes){
            this.name = name
            // this.start = start
            // this.end = end
            this.difficulty = difficulty
            this.routeNodes = routeNodes
        }

        add_node(node){
            this.routes.push(node);
        }
    }
    
        // Firestore data converter
    var nodeConverter = {
        toFirestore: function(node) {
            return {
                x: node.x,
                y: node.y,
                id: node.id,
                coordsX: node.coordsX,
                coordsY: node.coordsY
                };
        },
        fromFirestore: function(snapshot, options){
            const data = snapshot.data(options);
            return new Node(data.x, data.y, data.id, data.coordsX, data.coordsY);
        }
    };

        // Firestore data converter
        var routeConverter = {
            toFirestore: function(route) {
                return {
                    name: route.name,
                    difficulty: route.difficulty,
                    routeNodes: route.routeNodes
                    };
            },
            fromFirestore: function(snapshot, options){
                const data = snapshot.data(options);
                return new Route(data.name, data.difficulty, data.routeNodes);
            }
        };

    const buttonInput = document.getElementById('add-button');
    const wallButton = document.getElementById('wall-button');

    
    const nodeXVal = document.getElementById('input-field-x');
    const nodeYVal = document.getElementById('input-field-y');
    const nodeIdVal = document.getElementById('input-field-id');
    
    const searchButton = document.getElementById('search-button');
    const searchName = document.getElementById('search-node-id');

    const addNodeButton = document.getElementById('add-route-button');
    const saveRouteButton = document.getElementById('save-route-button');
    const routeNodeName = document.getElementById('add-route-node');
    const routeName = document.getElementById('route-name');
    const routeDiff = document.getElementById('difficulty');

    
    const displayX = document.getElementById('x-val');
    const displayY = document.getElementById('y-val');
    

   //add node to database
    buttonInput.addEventListener('click', function() {
  
        /*const newNode = new Node(nodeXVal.value, nodeYVal.value, nodeIdVal.value);
        database.collection("wall").doc("wall1").collection("nodes").withConverter(nodeConverter).add(newNode);
        nodeXVal.value = "";
        nodeYVal.value = "";
        nodeIdVal.value = "";*/

  })
  
    //outputs the x and y coords of a node given its name
    searchButton.addEventListener('click', function() {

        var nodesRef = database.collection("wall").doc("wall1").collection("nodes");
        var query = nodesRef.where("id", "==", searchName.value);

        query.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                console.log(doc.id, " => ", doc.data());
                displayX.innerHTML = "x:" + doc.data().x;
                displayY.innerHTML = "y:" + doc.data().y;
            });
        })
        searchName.value = "";
    })

    var tempRoute = [];

    //creates a new route, allowing the user to input the nodes in the route
    addNodeButton.addEventListener('click', function() {
        tempRoute.push(routeNodeName.value);
        routeNodeName.value = "";
    })

    //saves the current route and stores it into the database
    saveRouteButton.addEventListener('click', function() {
        var newRoute = new Route(routeName.value, routeDiff.value, tempRoute);
        database.collection("wall").doc("wall1").collection("routeNodes").withConverter(routeConverter).add(newRoute);
        tempRoute = [];
        routeDiff.value = "";
        routeName.value = "";
    })

    var xCoord = 8;
    var yCoord = 183;

    document.addEventListener('click', function(e) {
        console.log(document.elementFromPoint(e.pageX, e.pageY)); 
        console.log("clicked x: " + e.pageX + "clicked y: " + e.pageY);
        convertToPt(e.pageX-xCoord, e.pageY-yCoord);
     })

    //gets the svg file
    var svg = document.getElementById('svg-object');
    console.log(svg);
    //const svgS = document.querySelector('svg-object');
    
    function convertToPt(x,y){
        newX = x*(3/4);
        newY = y*(3/4);
        console.log(newX);
        console.log(newY);
    }
    
    
    //parse svg elements by their ids and stores the coordinates in firebase
    buttonInput.addEventListener("click", function(){
        var svgDoc = svg.contentDocument;
        count = 0;
        
        while (svgDoc.getElementById(`shape${count}`) != null){
       
            //var item0 = shape0.pathSegList[0];
            //console.log("x:", shape0.);
            console.log(`shape${count}`);
            var shape1 = svgDoc.getElementById(`shape${count}`);
            //var item1 = shape1.pathSegList[0];
            //console.log("x:" + item1.x + "y:" + item1.y);

            console.log("d: ", shape1.getAttribute("d"));
            
            //parsing the d attribute to get an array of points of each node
            var inputString = shape1.getAttribute("d");
            var indexOfC = inputString.indexOf('C');
            var stringWithoutC = inputString.substring(0, indexOfC);
            var replacedString = stringWithoutC.replace(/M/g, 'L');
            var segments = replacedString.split(/[LL]/).filter(Boolean); // Split based on 'M' or 'L' and remove empty strings

            var resultX = [];
            var resultY = [];
            for (var i = 0; i < segments.length; i++) {
                var values = segments[i].trim().split(/\s+/).map(parseFloat); // Split each segment by whitespace and parse values to floats
                resultX.push(values[0]);
                resultY.push(values[1]);
            }

            //console.log(result);
            
            //getting the transform.translate (x,y) of an element
            console.log("d: ", shape1.getAttribute("transform"));
            var regex = /translate\((-?\d+(\.\d+)?), (-?\d+(\.\d+)?)\)/;
            var match = shape1.getAttribute("transform").match(regex);

            if (match) {
            // Extract the numeric values and convert them to floats
                var xValue = parseFloat(match[1]);
                var yValue = parseFloat(match[3]);

                // Create a tuple with the extracted values
                var tuple = [xValue, yValue];
            }

            const newNode = new Node(tuple[0], tuple[1], count, resultX, resultY);
            database.collection("wall").doc("wall1").collection("nodes").withConverter(nodeConverter).add(newNode);

            count++;
        }

        var allNodes = [];
    })


  

