var Territories = {};
var Guilds = [];
let rectangles = [];
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
            let option1 = document.createElement("option");
            let option2 = document.createElement("option");
            var select1 = document.getElementById("changeguild");
            var select2 = document.getElementById("removeguild");
            option1.text = name;
            option2.text = name;
            select1.add(option1);
            select2.add(option2);
            console.log(`New guild with the name ${name} and color ${color}`);
        }
        changecolor (ncolor) {
            this.mapcolor = ncolor;
        }
    }
  
    function addguild()
    {
        let name = document.getElementById("name");
        let color = document.getElementById("color");
        if (name.value === "")
        {
            alert("No guild name specified!");
            return;
        }
        Guilds.push(new Guild(name.value, color.value));
        name.value = "";
        color.value = "#000000";
        alert("Successfully added the guild!");
    }
    function changecolor() {
        let select = document.getElementById('changeguild');
        let color = document.getElementById("changecolor");
        if (select.selectedIndex === 0) {
            alert("No guild selected!");
            return;
        }
        for (let i in Guilds) {
            if (Guilds[i].name === select.value) {
                Guilds[i].changecolor(color.value);
                break;
            }
        }
        select.selectedIndex = 0;
        render();
        alert(`Successfully changed ${select.value}'s color to ${color.value}`);
        color.value = '#000000';
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
        for (let i in Territories) {
            if (Territories[i] === select.value)
                Territories[i] = "-";
        }
        select.remove(select.selectedIndex);
        render();
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
        if (guildSelect.selectedIndex === 0)
            Territories[selectedTerritory] = "-";
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
  
      for (let a = 0; a < 4; a++) {
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
                    render(rectangles);
              });
  
      //on zoom end, update map based on zoom
      map.on('zoomend', () => {
          prevZoom = map.getZoom();
      });
      
      setInterval(render, 2000)
  }

      //rendering territories based on territory location, ownership, and settings. also updates leaderboard div
      function render() {
        Object.keys(Territories).forEach(territory => {
            let guild = Territories[territory];
            if (!guild || guild === "-") {
            rectangles[territory].unbindTooltip();
            rectangles[territory].setStyle({
                color: 'rgba(255,255,255,1)'
            });
          } else {
              for (let i in Guilds) {
                  if (Guilds[i].name === guild) {
                      rectangles[territory].unbindTooltip();
                      rectangles[territory].bindTooltip('<span class="territoryGuildName" style="color: '+Guilds[i].mapcolor+'">'+Guilds[i].name+'</span>',{sticky: true, interactive: false, permanent:true,direction:'center',className:'territoryName',opacity:1})
                      rectangles[territory].setStyle({
                          color: Guilds[i].mapcolor,
                      });
                      break;
                  }
              }
          }
        });
    }

  function reloadMenu() {
      // Change menu to territory
      var terr = document.getElementById('currentTerritory');
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

    var reader = new FileReader();
    reader.onload = function(file) {
        var data = JSON.parse(file.target.result);
        console.log(data);
        // Check if file is valid
        if (!data.territories || !data.guilds) return alert('Error: Invalid map save file provided')
        // Change data in the html
        Territories = data.territories;
        // Change html
        for (let i in data.guilds) {
            Guilds.push(new Guild(data.guilds[i].name, data.guilds[i].mapcolor))
        }
    }
    reader.readAsText(file)
}

function pullApi() {
    var c = confirm('WARNING: This will remove all current data. To save, press the Export button.');
    if (!c) return;
    var apiLoading = document.getElementById('api-loading');
    apiLoading.innerText = 'Loading... (This may take a long time)\nFetching the territory list...';
    Territories = {};
    Guilds = [];
    $('#changeguild').empty().append('<option selected="selected" value="null">--</option>');
    $('#removeguild').empty().append('<option selected="selected" value="null">--</option>');

    fetch('https://api.wynncraft.com/public_api.php?action=territoryList')
    .then(res => res.json())
    .then(json => {
        let territories = json.territories;
        let guilds = [];
        let guildPrefixes = {};
        let longest = 0;
        for (let i in territories) {
            apiLoading.innerText = 'Loading... (This may take a long time)\nProcessing data...'
            setTimeout(function() {
                if (guildPrefixes[territories[i].guild]) {
                    Territories[i] = guildPrefixes[territories[i].guild]
                    return;
                }
                if (actual_JSON)
                {
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
                    apiLoading.innerText = 'Loading... (This may take a long time)\nGuild missing in cache! Fetching Wynn API...'
                    longest++;
                    fetch(`https://api.wynncraft.com/public_api.php?action=guildStats&command=${territories[i].guild}`)
                    .then(res => res.json())
                    .then(json => {
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
        console.log( "Data obtained successfully" );
        Data = data  
        actual_JSON = data;
    }
    var jqxhr = $.getJSON( "guildTags.json", callback);
    return Data;
}