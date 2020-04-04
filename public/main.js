var Territories = {};
var Guilds = [];
var selectedTerritory = null;
var actual_JSON;

$(document).ready(function() {
    alert('This Map Maker Utility was created by bolyai and Nitrogen2Oxygen of HM Royal Engineers.');
    var realButton = document.getElementById('file-button');
    var importButton = document.getElementById('import-button');

    importButton.addEventListener('click', function() {
    realButton.click();
    realButton.addEventListener('change', importMap, false);
    });
    actual_JSON = getData();
    run(); 
  });

    class Guild {
        constructor(name, color) {
            this.name = name;
            this.mapcolor = color;
            let option = document.createElement("option");
            let select = document.getElementById("removeguild");
            option.text = name;
            select.add(option);
            console.log(`New guild with the name ${name} and color ${color}`);
        }
    }
  
    function addguild()
    {
        let name = document.getElementById("name");
        let color = document.getElementById("color").value;
        if (name.value === "")
        {
            alert("No guild name specified!");
            return;
        }
        Guilds.push(new Guild(name.value, color));
        name.value = "";
        color.value = "#000000";
        alert("Successfully added the guild!");
    }

    function removeguild()
    {
        let select = document.getElementById("removeguild");
        if (select.selectedIndex === 0)
        {
            alert("No guild selected!");
            return;
        }
        Guilds = Guilds.filter(x => (x.name != select.value));
        select.remove(select.selectedIndex);
        alert("Successfully removed the guild!");
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
      initTerrs();
      // Initializing events
      var guildSelect = document.getElementById('guilds');
        guildSelect.addEventListener('change', function() {
        Territories[selectedTerritory] = guildSelect.value;
        render();
    });
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
      let rectangles = [];
      let prevZoom = 7;
      
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
                  rectangle.on('click', function() {
                      selectedTerritory = territory.name;
                      console.log('Selected ' + selectedTerritory);
                      reloadMenu();
                  });
                  rectangle.addTo(map);
                  }	
              }).then(() => {
                    render();
              });
  
      //rendering territories based on territory location, ownership, and settings. also updates leaderboard div
      function render() {
              Object.keys(Territories).forEach(territory => {
                  let guild = Territories[territory];
                  if (!guild) {
                  rectangles[territory].setStyle({
                      color: 'rgba(255,255,255,1)'
                  });
                } else {
                    for (let i in Guilds) {
                        if (Guilds[i].name === guild) {
                            rectangles[territory].setStyle({
                                color: Guilds[i].mapcolor,
                            });
                            break;
                        }
                    }
                }
              });
      }
  
      //on zoom end, update map based on zoom
      map.on('zoomend', () => {
          prevZoom = map.getZoom();
      });

      setInterval(render, 2000)
  }

  function reloadMenu() {
      // Change menu to territory
      var terr = document.getElementById('currentTerritory');
      console.log(terr.innerText)
      terr.innerText = selectedTerritory;

      // Show options
      var enableButton = document.getElementById('enable-button');
      var terrSelector = document.getElementById('terr-select');
      enableButton.style.visibility='visible'
      terrSelector.style.visibility='visible'

      // Show correct options
      var territoryToggle = document.getElementById('territory-toggle');
      var guildSelect = document.getElementById('guilds');
      // Clear guild select
      var length = guildSelect.options.length;
      for (i = length-1; i >= 0; i--) {
        guildSelect.options[i] = null;
      }
      // Insert current guild select
      var currentOwner = Territories[selectedTerritory];
      var opt = document.createElement('option');
        opt.appendChild(document.createTextNode('--'));
        opt.value = null;
        if (!currentOwner) opt.selected = true;
        guildSelect.appendChild(opt); 
      for (let guild of Guilds) {
        var opt = document.createElement('option');
        opt.appendChild(document.createTextNode(guild.name));
        opt.value = guild.name;
        if (guild.name === currentOwner) opt.selected = true;
        guildSelect.appendChild(opt); 
      }
  }
  function exportMap() {
    var json = {
        territories: Territories,
        guilds: Guilds
    }
    console.log(json)
    var data = JSON.stringify(json);
    var a = document.createElement("a");
    var file = new Blob([data], {type: 'application/json'});
    a.href = URL.createObjectURL(file);
    a.download = 'Map.json';
    a.click();
}

function importMap(evt) {
    var file = evt.target.files[0];
    console.log(file)

    var reader = new FileReader();
    reader.onload = function(file) {
        var data = JSON.parse(file.target.result);
        console.log(data);
        // Check if file is valid
        if (!data.territories || !data.guilds) return alert('Error: Invalid map save file provided')
        // Change data in the html
        Territories = data.territories;
        Guilds = data.guilds;
        // Change html
        for (let i in data.guilds) {
            let name = data.guilds[i].name;
            let option = document.createElement("option");
            let select = document.getElementById("removeguild");
            option.text = name;
            select.add(option);

        }
    }
    reader.readAsText(file)
}

function pullApi() {
    var c = confirm('WARNING: This will remove all current data. To save, press the Export button.');
    if (!c) return;
    var apiLoading = document.getElementById('api-loading');
    apiLoading.innerText = 'Loading... (This may take a long time)'
    fetch('https://api.wynncraft.com/public_api.php?action=territoryList')
    .then(res => res.json())
    .then(json => {
        let territories = json.territories;
        let guilds = [];
        let guildPrefixes = {};
        let int = 0;
        let longest = 0;
        for (let i in territories) {
            int += 1
            setTimeout(function() {
                if (guildPrefixes[territories[i].guild]) {
                    console.log('quick ' + i)
                    Territories[i] = guildPrefixes[territories[i].guild]
                    return;
                }
                if (actual_JSON)
                {
                    console.log('long ' + i)
                    for (let j = 0; j < actual_JSON["guild"].length; j++) {
                        if (actual_JSON["guild"][j] === territories[i].guild)
                        {
                            Territories[i] = actual_JSON["tag"][j];
                            if (!guilds.includes(actual_JSON["tag"][j])) guilds.push(actual_JSON["tag"][j]);  
                            if (!guildPrefixes[territories[i].guild]) guildPrefixes[territories[i].guild] = actual_JSON["tag"][j];
                            break;
                        }
                    }
                }
                else
                {
                    console.log('longest ' + i)
                    longest++;
                    fetch(`https://api.wynncraft.com/public_api.php?action=guildStats&command=${territories[i].guild}`)
                    .then(res => res.json())
                    .then(json => {
                        //  if (!json.prefix) console.log('wait')
                        Territories[i] = json.prefix;
                        if (!guilds.includes(json.prefix)) guilds.push(json.prefix);  
                        if (!guildPrefixes[territories[i].guild]) guildPrefixes[territories[i].guild] = json.prefix;
                    })
                }
            }, longest*250 )
        }
        setTimeout(function() {
            Guilds = [];
            guilds.forEach(g => {
            Guilds.push(new Guild(g, "#000000".replace(/0/g, _ => (~~(Math.random()*16)).toString(16))));
        });
        apiLoading.innerText = 'Loaded!';
            alert('Wynn API has finished loading. Feel free to change around colors and territories.')
        }, longest*250 + 1000)
    })
}

function getData()
{
    var Data;
    function callback (data)
    {
        console.log( "success" );
        Data = data  
        actual_JSON = data;
    }
    var jqxhr = $.getJSON( "guildTags.json", callback);
    return Data;
}