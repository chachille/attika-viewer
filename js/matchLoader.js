document.addEventListener("DOMContentLoaded", function () {

  const navLinks = document.querySelectorAll(".top-bar-menu a");

  navLinks.forEach(link => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const view = this.getAttribute("datavalue");

      switch (view) {
        case "matches":
          loadMatches();
          break;
        case "standings":
          loadStandings();
          break;
        case "overview":
          loadOverview();
          break;
        default:
          console.warn("Unknown view:", view);
      }

      navLinks.forEach((item) => item.classList.remove("active"));
      link.classList.add("active");
    });
  });
});

//
// OVERVIEW
//
export async function loadOverview(containerSelector = '.cards-container') {
  console.log(' -- loadOverview --');
  // Vars used to calculate
  const today = new Date();
  const res = await fetch('data/tournaments.json');
  const tournaments = await res.json();

  const tournamentContainer = document.querySelector(containerSelector);
  tournamentContainer.innerHTML = ''; // Clear previous content
  tournamentContainer.classList.add('overview');

  tournaments.forEach(tournament => {
    if (tournament.matchdays.length > 0) {
      // Converted Dates on Matchdays
      const parsedMatchdays = tournament.matchdays.map(md => ({
        ...md,
        date1: new Date(md?.date_option_1),
        date2: new Date(md?.date_option_2)
      }));
      // Sort by date option 1
      parsedMatchdays.sort((a, b) => a.date1 - b.date1);
      console.log(parsedMatchdays);

      // Find Previeous
      const prevMD = [...parsedMatchdays].reverse().find(md => md?.date1 < today);
      console.log([...parsedMatchdays]);
      const prevMDBlock = createMatchDayCard(prevMD);
      tournamentContainer.appendChild(prevMDBlock);

      // Find Next
      const nextMD = [...parsedMatchdays].find(md => md?.date1 >= today);
      console.log(nextMD);
      const nextMDBlock = createMatchDayCard(nextMD);
      tournamentContainer.appendChild(nextMDBlock);

      const standingsBlock = document.createElement('div');
      standingsBlock.className = 'cards-container-standings';
      standingsBlock.classList.add('league-table-card')

      //standingsBlock.id = "overview-tournaments";
      // await loadStandings("overview-tournaments", 1, true);
      const stBlock = createStandingsCard(tournament, 1, true);
      standingsBlock.append(stBlock);
      tournamentContainer.appendChild(standingsBlock);
    }
  });
}


//
// CREATE MATCHDAY CARD
//
function createMatchDayCard(md) {
  console.log(' -- createMatchDayCard --');
  console.log(md);

  const matchDayBlock = document.createElement('div');
  matchDayBlock.className = 'cards-container';

  const titleBlock = document.createElement('div');
  titleBlock.className = 'container-title';

  const titleMatchday = document.createElement('div');
  titleMatchday.className = 'container-title-matchday';
  titleMatchday.textContent = `${md?.number}η Αγωνιστική`;

  const titleDates = document.createElement('div');
  titleDates.className = 'container-title-dates';
  titleDates.textContent = `${formatDate(md?.date_option_1)} - ${formatDate(md?.date_option_2)}`;

  const matchDayDate = new Date(md?.date_option_1);
  matchDayBlock.setAttribute("matchday-date", md?.date_option_1);

  titleBlock.appendChild(titleMatchday);
  titleBlock.appendChild(titleDates);
  matchDayBlock.appendChild(titleBlock);

  // Loop through matches
  md?.matches.forEach(match => {
    const card = document.createElement('div');
    card.className = 'match-card';
    card.innerHTML = createMatchCardHtml(match);

    matchDayBlock.appendChild(card);
  });
  return matchDayBlock;
}


//
// CREATE MATCH CARD
//
function createMatchCardHtml(match) {
  const homeScore = match.status != 'Played' ? '' : match.home_score;
  const awayScore = match.status != 'Played' ? '' : match.away_score;
  const venue = match.location != null ? match.location : '';
  const winnerIcon = match.status != 'Played' ? '' : '🏆';

  const html = `
          <div class="match-grid">
            <div class="match-result-grid">
              <!-- HOME TEAM -->
              <div class="match-team-grid">
                <div class="match-winner">${match.home_score > match.away_score ? winnerIcon : ''}</div>
                <div class="match-team-logo">
                  <img src="assets/${match.home_team_badge}" class="team-badge" >
                </div>
                <div class="match-team-name">${match.home_team_name}</div>
                <div class="home-score">${homeScore}</div>
              </div>
              <!-- AWAY TEAM -->
              <div class="match-team-grid">
                <div class="match-winner">${match.away_score > match.home_score ? winnerIcon : ''}</div>
                <div class="match-team-logo">
                  <img src="assets/${match.away_team_badge}" class="team-badge">
                </div>
                <div class="match-team-name">${match.away_team_name}</div>
                <div class="away-score">${awayScore}</div>
              </div>
            </div>
            <!-- MATCH INFO -->
            <div class="match-info-grid">
              <div class="match-info-date">${formatDate(match.date)}</div>
              <div class="match-info-venue">${venue}</div>
            </div>
          </div>
        `;

  return html;
}

//
// LOAD MATCHES
//
export async function loadMatches(containerSelector = '.cards-container') {

  // Vars used for autoscroll to next matchday
  const today = new Date();
  let targetCard = null;

  const res = await fetch('data/tournaments.json');
  const tournaments = await res.json();

  const container = document.querySelector(containerSelector);
  container.innerHTML = ''; // Clear previous content

  tournaments.forEach(tournament => {
    tournament.matchdays.forEach(matchday => {
      // Create matchday title block
      const containerBlock = document.createElement('div');
      containerBlock.className = 'cards-container';


      const titleBlock = document.createElement('div');
      titleBlock.className = 'container-title';

      const titleMatchday = document.createElement('div');
      titleMatchday.className = 'container-title-matchday';
      titleMatchday.textContent = `${matchday.number}η Αγωνιστική`;

      const titleDates = document.createElement('div');
      titleDates.className = 'container-title-dates';
      titleDates.textContent = `${formatDate(matchday.date_option_1)} - ${formatDate(matchday.date_option_2)}`;

      const matchDayDate = new Date(matchday.date_option_1);
      containerBlock.setAttribute("matchday-date", matchDayDate.toDateString());

      // Store matchcard to automatically scroll to that
      if (matchDayDate >= today && targetCard == null) {
        targetCard = containerBlock;
      }

      titleBlock.appendChild(titleMatchday);
      titleBlock.appendChild(titleDates);
      container.appendChild(titleBlock);

      // Loop through matches
      matchday.matches.forEach(match => {
        const card = document.createElement('div');
        card.className = 'match-card';
        card.innerHTML = createMatchCardHtml(match);

        containerBlock.appendChild(card);
      });
      container.appendChild(containerBlock);
    });

    // Scroll to MatchCard near to Today
    // if (targetCard) {
    //   targetCard.scrollIntoView({
    //     behavior: "smooth",
    //     block: "center",
    //     inline: "nearest"
    //   });
    // }
  });
}

export async function loadStandings(containerSelector = '.cards-container', tournamentId = 1, shrinked = true) {
  const res = await fetch('data/tournaments.json');
  const tournaments = await res.json();
  const container = document.querySelector(containerSelector);
  container.innerHTML = ''; // Clear previous content

  const today = new Date().toLocaleDateString();

  tournaments.forEach(tournament => {
    if (tournamentId > -1 &&
      tournament.tournament_id != tournamentId) {
      return;
    }
    //
    // Create card container for Tournament Standings table
    const containerBlock = document.createElement('div');
    containerBlock.className = 'league-table-card';

    const titleBlock = document.createElement('div');
    titleBlock.className = 'container-title';

    const titleMatchday = document.createElement('div');
    titleMatchday.className = 'container-title-matchday';
    titleMatchday.textContent = `Βαθμολογία`;

    const titleDates = document.createElement('div');
    titleDates.className = 'container-title-dates';
    titleDates.textContent = `${today}`;

    titleBlock.appendChild(titleMatchday);
    titleBlock.appendChild(titleDates);
    container.appendChild(titleBlock);

    // Add standings table (table-container & table)
    const standingsTableContainer = document.createElement('div');
    standingsTableContainer.className = 'table-container';
    const standingsTable = document.createElement('TABLE');
    // Add headers
    const standingsTableHead = standingsTable.createTHead('thead');
    var headerTitles = ["#", "Ομάδα", "", "Βαθ<br>Σύνολο",
      "Βαθ.<br>Εντός", "Βαθ.<br>Εκτός", "Α", "Ν", "Ι", "Η",
      "Γκολ<br>Υπέρ", "Γκολ<br>Κατά", "Γκολ<br>Διαφ.",
      "Εντος<br>Γκολ<br>Υπέρ", "Εντος<br>Γκολ<br>Κατά", "Εντος<br>Γκολ<br>Διαφ.",
      "Εκτός<br>Γκολ<br>Υπέρ", "Εκτός<br>Γκολ<br>Κατά", "Εκτός<br>Γκολ<br>Διαφ.",];
    var standingRecValNames = ["Position", "TeamBadge", "TeamName", "Points",
      "PtsH", "PtsA", "Plays", "Wins", "Draws", "Loses",
      "GF", "GA", "GD", "GFH", "GAH", "GDH", "GFA", "GAA", "GDA"];

    // Enlarged version of Standing
    if (shrinked) {
      const headerTitles = ["#", "Ομάδα", "", "Βαθμοί",
        "Π", "Ν", "Ι", "Η",
        "ΥΓ", "ΚΓ", "ΔΓ"];
      const standingRecValNames = ["Position", "TeamBadge", "TeamName", "Points",
        "Plays", "Wins", "Draws", "Loses",
        "GF", "GA", "GD"];
    }
    // Shrinked version of Standings
    const standingsTableHeadRow = standingsTableHead.insertRow();
    for (let i = 0; i < headerTitles.length; i++) {
      const headCell = standingsTableHeadRow.insertCell();
      headCell.innerHTML = headerTitles[i];
      headCell.style.textAlign = "right";
    }
    const badgeHCell = standingsTableHead.rows[0].cells[1];
    const teamHCell = standingsTableHead.rows[0].cells[2];
    badgeHCell.colSpan = 2;
    badgeHCell.style.textAlign = "left";
    badgeHCell.padding = "8px 1px 8px 8px"
    teamHCell.padding = "8px 8px 8px 2px"
    standingsTableHead.rows[0].deleteCell(2);

    tournament.standings.forEach(standingsRec => {
      const tableRow = standingsTable.insertRow();

      for (let i = 0; i < standingRecValNames.length; i++) {
        const valueCell = tableRow.insertCell();
        if (i == 1 || i == 2) {
          if (i == 1) {
            valueCell.innerHTML = '<img src=assets/' + standingsRec[standingRecValNames[i]] + ' class="team-badge"></img>';
            valueCell.style.padding = "8px 1px 8px 8px";
          } else {
            valueCell.innerHTML = standingsRec[standingRecValNames[i]];
            valueCell.style.padding = "8px 8px 8px 2px";
          }
        } else {
          valueCell.innerHTML = standingsRec[standingRecValNames[i]];
        }
        if (i != 1 && i != 2) {
          valueCell.style.textAlign = "right";
        } else {
          valueCell.style.textAlign = "left";
        }
      }
    });
    standingsTableContainer.appendChild(standingsTable);

    containerBlock.appendChild(standingsTableContainer);
    container.appendChild(containerBlock);
  });
}



function createStandingsCard(tournament, shrinked = true) {
  const today = new Date().toLocaleDateString();
  //
  // Create card container for Tournament Standings table
  const containerBlock = document.createElement('div');
  containerBlock.className = 'league-table-card';

  const titleBlock = document.createElement('div');
  titleBlock.className = 'container-title';

  const titleMatchday = document.createElement('div');
  titleMatchday.className = 'container-title-matchday';
  titleMatchday.textContent = `Βαθμολογία`;

  const titleDates = document.createElement('div');
  titleDates.className = 'container-title-dates';
  titleDates.textContent = `${today}`;

  titleBlock.appendChild(titleMatchday);
  titleBlock.appendChild(titleDates);
  containerBlock.appendChild(titleBlock);

  // Add standings table (table-container & table)
  const standingsTableContainer = document.createElement('div');
  standingsTableContainer.className = 'table-container';
  const standingsTable = document.createElement('TABLE');
  // Add headers
  const standingsTableHead = standingsTable.createTHead('thead');
  var headerTitles = ["#", "Ομάδα", "", "Βαθ<br>Σύνολο",
    "Βαθ.<br>Εντός", "Βαθ.<br>Εκτός", "Α", "Ν", "Ι", "Η",
    "Γκολ<br>Υπέρ", "Γκολ<br>Κατά", "Γκολ<br>Διαφ.",
    "Εντος<br>Γκολ<br>Υπέρ", "Εντος<br>Γκολ<br>Κατά", "Εντος<br>Γκολ<br>Διαφ.",
    "Εκτός<br>Γκολ<br>Υπέρ", "Εκτός<br>Γκολ<br>Κατά", "Εκτός<br>Γκολ<br>Διαφ.",];
  var standingRecValNames = ["Position", "TeamBadge", "TeamName", "Points",
    "PtsH", "PtsA", "Plays", "Wins", "Draws", "Loses",
    "GF", "GA", "GD", "GFH", "GAH", "GDH", "GFA", "GAA", "GDA"];

  // Enlarged version of Standing
  if (shrinked) {
    console.log('-------  createStandingsCard -------')
    console.log(shrinked);
    headerTitles = ["#", "Ομάδα", "", "Βαθμοί",
      "Π", "Ν", "Ι", "Η",
      "ΥΓ", "ΚΓ", "ΔΓ"];
    standingRecValNames = ["Position", "TeamBadge", "TeamName", "Points",
      "Plays", "Wins", "Draws", "Loses",
      "GF", "GA", "GD"];
  }
  // Shrinked version of Standings
  const standingsTableHeadRow = standingsTableHead.insertRow();
  for (let i = 0; i < headerTitles.length; i++) {
    const headCell = standingsTableHeadRow.insertCell();
    headCell.innerHTML = headerTitles[i];
    headCell.style.textAlign = "right";
  }
  const badgeHCell = standingsTableHead.rows[0].cells[1];
  const teamHCell = standingsTableHead.rows[0].cells[2];
  badgeHCell.colSpan = 2;
  badgeHCell.style.textAlign = "left";
  badgeHCell.padding = "8px 1px 8px 8px"
  teamHCell.padding = "8px 8px 8px 2px"
  standingsTableHead.rows[0].deleteCell(2);

  tournament.standings.forEach(standingsRec => {
    const tableRow = standingsTable.insertRow();

    for (let i = 0; i < standingRecValNames.length; i++) {
      const valueCell = tableRow.insertCell();
      if (i == 1 || i == 2) {
        if (i == 1) {
          valueCell.innerHTML = '<img src=assets/' + standingsRec[standingRecValNames[i]] + ' class="team-badge"></img>';
          valueCell.style.padding = "8px 1px 8px 8px";
        } else {
          valueCell.innerHTML = standingsRec[standingRecValNames[i]];
          valueCell.style.padding = "8px 8px 8px 2px";
        }
      } else {
        valueCell.innerHTML = standingsRec[standingRecValNames[i]];
      }
      if (i != 1 && i != 2) {
        valueCell.style.textAlign = "right";
      } else {
        valueCell.style.textAlign = "left";
      }
    }
  });
  standingsTableContainer.appendChild(standingsTable);

  // containerBlock.appendChild(standingsTableContainer);
  return standingsTableContainer;
}

// Optional: Format date from YYYY-MM-DD to DD/MM/YYYY
function formatDate(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}
