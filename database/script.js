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

    const auth = firebase.auth();
    var provider = new firebase.auth.GoogleAuthProvider();
    
    const storage = firebase.storage();
    var svgRef = storage.ref('nodes1.svg');
   
   

    //fetching svg file from firebase - currently not functional

    svgRef.getDownloadURL()
    .then((url) => {
        console.log("url: " + url);
        console.log("ref: " + svgRef);
        
        // This can be downloaded directly:
        var xhr = new XMLHttpRequest();
        xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
        xhr.responseType = 'blob';
        xhr.onload = (event) => {
        var blob = xhr.response;
        console.log("blob: " + blob);

        };
        xhr.open('GET', url);
        xhr.send();

        console.log("blob: " + blob);

        var svgO = document.getElementById("svg-object");
        svgO.setAttribute("data", url);
    })
    .catch((error) => {
    // A full list of error codes is available at
    // https://firebase.google.com/docs/storage/web/handle-errors
    switch (error.code) {
        case 'storage/object-not-found':
        // File doesn't exist
        break;
        case 'storage/unauthorized':
        // User doesn't have permission to access the object
        break;
        case 'storage/canceled':
        // User canceled the upload
        break;

        // ...

        case 'storage/unknown':
        // Unknown error occurred, inspect the server response
        break;
    }
    });




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
        constructor(name , difficulty, routeNodes, author){
            this.name = name
            // this.start = start
            // this.end = end
            this.difficulty = difficulty
            this.routeNodes = routeNodes
            this.author = author
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
                    routeNodes: route.routeNodes,
                    author:route.author
                    };
            },
            fromFirestore: function(snapshot, options){
                const data = snapshot.data(options);
                return new Route(data.name, data.difficulty, data.routeNodes, data.author);
            }
        };

    const buttonInput = document.getElementById('add-button');

    const signInButton = document.getElementById('sign-in-button');

    
    const searchButton = document.getElementById('search-button');
    const searchName = document.getElementById('search-node-id');

    const routeName = document.getElementById('route-name');
    const routeDiff = document.getElementById('difficulty');
    const startRouteButton = document.getElementById('start-route-button');
    var currRouteMade = false; 
    const createRouteButton = document.getElementById('create-route-button');
   
    const displayX = document.getElementById('x-val');
    const displayY = document.getElementById('y-val');

    const displaySearchText = document.getElementById("word-box");
    
    const routeNameText = document.getElementById("route-name-text");
    const routeAuthorText = document.getElementById("route-author");

    const searchDiffButton = document.getElementById("search-diff-button");
    const searchRouteDiff = document.getElementById("search-route-diff");
    const nextDiffButton = document.getElementById("next-route-button");
    const prevDiffButton = document.getElementById("previous-route-button");
    const currRouteText = document.getElementById("curr-route-text");
    const resetPageButton = document.getElementById("reset-button");

    window.addEventListener("load", function(){
        getImgCoord();
        var nodesRef = database.collection("wall").doc("wall1").collection("nodes").withConverter(nodeConverter);
        nodesRef.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                var n = doc.data();
                allNodes.push(n);
            });
        })
        
    })

    window.addEventListener("load", function(){
        var collectionRef = database.collection("wall").doc("wall1").collection("nodes");
        var query = collectionRef.where("id", "==", 0);
        query.get()
            .then((querySnapshot) => {
                console.log(querySnapshot);
                if (querySnapshot.empty) {
                    console.log("empty");
                    addNodes();
                }
                else{
                    console.log("not empty");
                }
            })
            .catch(function(error) {
                console.error("Error checking collection:", error);
            });
    })
   
    
    var svg = document.getElementById('svg-object');
    console.log("svg: " + svg);
    var xCoord;
    var yCoord;

    function getImgCoord(){ 
        wallPic = document.getElementById("image");
        yCoord = 0;
        xCoord = 0;

       while( wallPic != null ) { 
            yCoord += wallPic.offsetTop;
            xCoord += wallPic.offsetLeft;
            wallPic = wallPic.offsetParent;
        }

        console.log("x: "+xCoord +"\ny: "+yCoord);
        svg.style.top = yCoord+"px";
        svg.style.left = xCoord+"px";
    }

    var allNodes = [];
    var signedIn = false;
    //Authentication and user events.
    signInButton.addEventListener("click", function(){

        if(signedIn)
        {
            console.log("signing out");
            firebase.auth().signOut().then(() => {
               console.log("signed out!");
               signInButton.innerHTML = "Sign In";
              }).catch((error) => {
                // An error happened.
              });
              signedIn = false;
        }
        else{
            firebase.auth()
                .signInWithRedirect(provider)
                .then((result) => {
                /** @type {firebase.auth.OAuthCredential} */
                var credential = result.credential;

                // This gives you a Google Access Token. You can use it to access the Google API.
                var token = credential.accessToken;
                // The signed-in user info.
                var user = result.user;
                console.log("credential:"+credential);

                console.log("user:"+user.displayName);
                signedIn = true;
                // IdP data available in result.additionalUserInfo.profile.
                // ...
                }).catch((error) => {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                // The email of the user's account used.
                var email = error.email;
                // The firebase.auth.AuthCredential type that was used.
                var credential = error.credential;
                // ...
            });
        }
        

    })
    //called when user state changes
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            signedIn = true;
            const displayName = user.displayName;
            const email = user.email;
            const photoURL = user.photoURL;
            const emailVerified = user.emailVerified;
            console.log("YOYOYO"+displayName);
            signInButton.innerHTML = displayName;

          // User is signed in, see docs for a list of available properties
          // https://firebase.google.com/docs/reference/js/v8/firebase.User
          var uid = user.uid;
          // ...
        } else {
          // User is signed out
          // ...
        }
      });

    /*const user = firebase.auth().currentUser;
    if (user !== null) {
    // The user object has basic properties such as display name, email, etc.
        const displayName = user.displayName;
        const email = user.email;
        const photoURL = user.photoURL;
        const emailVerified = user.emailVerified;

        
        // The user's ID, unique to the Firebase project. Do NOT use
        // this value to authenticate with your backend server, if
        // you have one. Use User.getIdToken() instead.
        const uid = user.uid;
    }*/


    //parse svg elements by their ids and stores the coordinates in firebase
    function addNodes(){
        var svgDoc = svg.contentDocument;

        count = 0;
        while (svgDoc.getElementById(`shape${count}`) != null){
       
            console.log(`shape${count}`);
            var shape1 = svgDoc.getElementById(`shape${count}`);
           

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
    }

    function changeColour(id, colour){
        var svgDoc = svg.contentDocument;
        var shape = svgDoc.getElementById(`shape${id}`);
        shape.setAttribute("stroke", colour);
    }


    // var xCoord = 8;
    // var yCoord = 350;

    document.addEventListener('click', function(e) {
        console.log(document.elementFromPoint(e.pageX, e.pageY)); 
        console.log("clicked x: " + e.pageX + "clicked y: " + e.pageY);
        convertToPt(e.pageX-xCoord, e.pageY-yCoord);
     })

    

    //gets the svg file
    

    function convertToPt(x,y){
        newX = x*(3/4);
        newY = y*(3/4);
        console.log(newX);
        console.log(newY);
        selectNodes(newX, newY);
    }
    
    var newRoute = [];
    
    startRouteButton.addEventListener("click", function(){
        routeNameText.innerHTML = "";
        routeAuthorText.innerHTML = "";
        currRouteText.innerHTML = "";
        currRouteMade = true;        
        newRoute = [];
        displaySearchText.innerHTML = "Creating route...";
        getImgCoord();
        resetPage();
    })

    function selectNodes(xClick,yClick){
        var svgDoc = svg.contentDocument;
        if (currRouteMade){
            for (var i = 0; i< allNodes.length; i++){
                var maxX = 0;
                var maxY = 0;
                for(var j = 0; j < allNodes[i].coordsX.length; j++){
                    if(allNodes[i].coordsX[j] > maxX) maxX = allNodes[i].coordsX[j];
                }
                for(var k = 0; k < allNodes[i].coordsY.length; k++){
                    if(allNodes[i].coordsY[k] > maxY) maxY = allNodes[i].coordsY[k];
                }

                if ((allNodes[i].x < xClick) &&
                (allNodes[i].x + maxX > xClick) &&
                (allNodes[i].y < yClick) && 
                (allNodes[i].y + maxY > yClick)){
                    var shape = svgDoc.getElementById(`shape${allNodes[i].id}`);
                    if (shape.getAttribute("stroke") == "#000000"){
                        shape.setAttribute("stroke" , "red");
                        newRoute.push(allNodes[i].id);
                    }
                    else{
                        shape.setAttribute("stroke" , "#000000");
                        newRoute.splice(newRoute.indexOf(allNodes[i].id, 1));
                    }
                    break;
                }
            }
        }
    }

    createRouteButton.addEventListener("click", function(){
        if(newRoute.length > 0 && routeName.value != "" && routeDiff.value != "")
        {
            var routesRef = database.collection("wall").doc("wall1").collection("routeNodes");
            var query = routesRef.where("name", "==", routeName.value);
            var nodes;
            query.get().then((querySnapshot) => {
                if (!querySnapshot.empty){
                    console.log(searchName.value);
                    displaySearchText.innerHTML = routeName.value + " already exists. Try another name.";
                    routeName.value = "";
                }
                else{
                    var routeAuthor = "Guest";
                    const user = firebase.auth().currentUser;
                    if(user!=null) routeAuthor = user.displayName;
                    var createdRoute = new Route(routeName.value, routeDiff.value, newRoute, routeAuthor);
                    database.collection("wall").doc("wall1").collection("routeNodes").withConverter(routeConverter).add(createdRoute);
                    displaySearchText.innerHTML = routeName.value + " successfully added.";
                    for (var i =0; i < newRoute.length; i++){
                        changeColour(newRoute[i] , "#000000");
                    }
                    routeName.value = "";
                    routeDiff.value = "";  
                    currRouteMade = false;
                }
            })
        }
        else{
            displaySearchText.innerHTML = "Please give the route a name and/or difficulty.";

        }
    })
        
    
    //displays route given name
    searchButton.addEventListener('click', function() {
        routeNameText.innerHTML = "";
        routeAuthorText.innerHTML = "";
        currRouteText.innerHTML = "";
        
       resetPage();

        var routesRef = database.collection("wall").doc("wall1").collection("routeNodes");
        var query = routesRef.where("name", "==", searchName.value);
        var nodes;
        query.get().then((querySnapshot) => {
            if (querySnapshot.empty){
                routeNameText.innerHTML = searchName.value + " not found";
                searchName.value = "";
                getImgCoord(); 

            }
            else{
                querySnapshot.forEach((doc) => {
                    var route = doc.data();
                    nodes = route.routeNodes;
                    console.log("nodes:"+nodes.length);
                    
                    for(var i = 0; i < nodes.length; i++) {
                        changeColour(nodes[i], "red");
                    } 
                    searchName.value = "";

                    routeNameText.innerHTML = "Route name: "+ route.name;
                    
                    routeAuthorText.innerHTML = "Created by: " + route.author;
                    getImgCoord(); 
            });
            }
            

        });  
    })

    var displayedRoutes;
    var currIndexRoute;

    searchDiffButton.addEventListener('click', function(){
        currIndexRoute = 0;
        displayedRoutes = [];
        var routesRef = database.collection("wall").doc("wall1").collection("routeNodes");
        var query = routesRef.where("difficulty", "==", searchRouteDiff.value);
        query.get().then((querySnapshot) => {
            if (querySnapshot.empty){
                currRouteText.innerHTML = "There are no routes with "+ searchRouteDiff.value+ " difficulty.";
                getImgCoord();
                searchRouteDiff.value = "";
                resetPage();
            }
            else{
                querySnapshot.forEach((doc) => {
                    var route = doc.data();
                    displayedRoutes.push(route);
                    displayDiffRoute(currIndexRoute);
                });
            }
        });
    })

    nextDiffButton.addEventListener('click', function(){
        if(currIndexRoute<displayedRoutes.length-1) currIndexRoute++;
        displayDiffRoute(currIndexRoute); 
    })

    prevDiffButton.addEventListener('click', function(){
        if(currIndexRoute>0) currIndexRoute--;
        displayDiffRoute(currIndexRoute);
    })

    function displayDiffRoute (index) {
       
        resetPage();
        currRouteText.innerHTML = (index+1) + "-" + displayedRoutes.length + " : " + displayedRoutes[index].name;
        var nodes = displayedRoutes[index].routeNodes;
        for(var i = 0; i < nodes.length; i++) {
            changeColour(nodes[i], "red");
        }
            
         
        getImgCoord();
        searchRouteDiff.value = "";
    }

    function resetPage(){
        for (var i =0; i < allNodes.length; i++){
            changeColour(allNodes[i].id, "#000000");
        }
    }

    resetPageButton.addEventListener("click", function(){
        resetPage();
        routeName.value = "";
        routeDiff.value = "";
        displaySearchText.innerHTML = "Route not started...";
        routeNameText.innerHTML = "";
        routeAuthorText.innerHTML = "";
        searchName.value = ""; 
        searchRouteDiff.value = "";
        currRouteText.innerHTML = "";
        getImgCoord();
    })


  

