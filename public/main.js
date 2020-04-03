var Territories = {}

function toggle() {
    if (document.getElementById("menu").style.display === "block") {
         document.getElementById("menu").style.display = "none";
    } else {
        document.getElementById("menu").style.display = "block";
    }
  }
  
  function initTerrs() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            territories = JSON.parse(this.responseText);
            for (let i in territories) {
                Territories[territories[i].name] = null;
            }
        }
    };
    xhttp.open("GET", "https://raw.githubusercontent.com/DevScyu/Wynn/master/territories.json", true);
    xhttp.send();
  }

  function run() {
      alert('This Map Maker Utility was created by bolyai and Nitrogen2Oxygen of HM Royal Engineers.');
      initTerrs();
      // initializing map
      let bounds = [];
      let images = [];
  
      const map = L.map("map", {  
          crs: L.CRS.Simple,
          minZoom: 6,
          maxZoom: 10,
          zoomControl: false,
          zoom: 8
      });	
  
      L.control.zoom({
          position:'topright'
      }).addTo(map);
  
      map.fitBounds([[0, -4], [6, 2]]);
  
      for (let a = 0; a < 3; a++) {
          for (let b = 0; b < 3; b++) {
              bounds.push([[a*2,(2*b)-4], [(a+1)*2, (2*(b+1))-4]])
          }	
      }
  
      for (let bound of bounds) {
          images.push(L.imageOverlay(`./tiles/${bound[0][1]}/${bound[0][0]}.png`, 
              bound, {
                  attribution: "<a href='https://wynndata.tk/map'>WYNNDATA</a>"
                  }
              ));
      }
  
      for (let image of images) {
          image.addTo(map);
      }
  
      //initializing variables
      let guildTerritories = [];
      let rectangles = [];
      let cdRectangles = [];
      let guilds = [];
      let leaderboard = [];
      let prevZoom = 7;
      let refresh = 60;
      let colors = 
      {
          "Blacklisted": "#323232",
          "Paladins United": "#fff0f5",
          "Imperial":  "#990033",
          "Avicia":  "#1010fe",
          "BuildCraftia": "#09EA2B",
          "Caeruleum Order": "#012142",
          "The Simple Ones": "#0fcad6",
          "Kingdom Foxes": "#ff8800",
          "Fantasy": "#21c8ec",
          "Emorians": "#1b5ff1",
          "House of Sentinels": "#580000"
      }
  
      //grabbing options elements
      let slider = document.getElementById("rate-option");
      let output = document.getElementById("rate-display");
      output.innerHTML = slider.value; 
  
      let checkboxTerritory = document.getElementById("territory-toggle");
      let checkboxNames = document.getElementById("territory-names");
      let checkboxGuilds = document.getElementById("territory-guilds"); 
  
      let territoryToggle = true;
      let territoryNames = false;
      let guildNames = true;
  
      let counter = refresh
      document.getElementById("countdown").innerHTML = counter;
  
      slider.oninput = function() {
          refresh = this.value;
            output.innerHTML = this.value;
      }
  
      checkboxTerritory.oninput = function() {
          territoryToggle = this.checked;
          
          checkboxNames.checked = this.checked;
          checkboxGuilds.checked = this.checked;
          territoryNames = this.checked;
          guildNames = this.checked;
          
          render();
      }
  
      checkboxNames.oninput = function() {
          territoryNames = this.checked
          render();
      }
  
      checkboxGuilds.oninput = function() {
          guildNames = this.checked
          render();
      }
      
      //setting up territories
      fetch("https://raw.githubusercontent.com/DevScyu/Wynn/master/territories.json")
              .then(response =>
              response.json())
              .then(json => {
                 for (let territory of json) {
                  let bounds = [territory["start"].split(","), territory["end"].split(",")];
                  for (let i in bounds) {	
                      bounds[i][0] *= .001
                         bounds[i][1] *= .001
                     }
  
                  bounds[0].reverse();
                  bounds[1].reverse();
  
                  bounds[0][0] *= -1;
                  bounds[1][0] *= -1;
                  let rectangle = L.rectangle(bounds, 
                      {color: "rgb(0, 0, 0, 0)", weight: 2})
                  rectangles[territory["name"]] = rectangle;
                  rectangle.addTo(map);
                  }	
              }).then(_ => {
                    setTimeout(render, 2000);
              });
  
      //rendering territories based on territory location, ownership, and settings. also updates leaderboard div
      function render() {
          console.log('rendering..')
              Object.keys(Territories).forEach(territory => {
                  let guild = Territories[territory];
                  if (!guild) {
                  rectangles[territory].setStyle({
                      color: 'rgba(255,255,255,1)'
                  })
                } else {
                    if (!(Object.keys(colors).includes(guild))) {
                        colors[guild] = "#000000".replace(/0/g, _ => (~~(Math.random()*16)).toString(16));;
                    }  
                    rectangles[territory].setStyle({
                        color: colors[guild],
                    });
                }
              });
      }
  
      tick()
  
      function tick() {
          console.log(cdRectangles)
          setTimeout(_ => {
              tick()
          }, 1000)
  
          counter += -1;
          document.getElementById("countdown").innerHTML = counter;
  
          Object.keys(cdRectangles).forEach(territory => {
                  let guild = guildTerritories[territory]["guild"];
                  // setContent(guildTerritories[territory]["guild"], territory)
          })
      }
  
      //on zoom end, update map based on zoom
      map.on('zoomend', _ => {
          if ((map.getZoom() >= 7 && prevZoom <= 7) || (map.getZoom() <= 7 && prevZoom >= 7)) {
              for (let territory of Object.keys(rectangles)) {
                  // setContent(guildTerritories[territory]["guild"], territory);
              }
          }
  
          prevZoom = map.getZoom();
      });
  
      document.getElementById("info").style.opacity = 0; 
  }
  