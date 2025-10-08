document.addEventListener("DOMContentLoaded", function () {

  const navLinks = document.querySelectorAll(".top-bar-menu a");

  navLinks.forEach(link => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const view = this.getAttribute("datavalue");
      navLinks.forEach((item) => item.classList.remove("active"));
      link.classList.add("active");

      switch (view) {
        case "matches":
          loadMatches();
          break;
        case "standings":
          loadStandings();
          break;
        // case "overview":
        //   loadOverview();
        //   break;
        default:
          console.warn("Unknown view:", view);
      }
    });
  });
});


export async function loadMatches(containerSelector = '.cards-container') {

  //
  // Clear Active from previous menu
  //
  menuLinks.forEach((item) => item.classList.remove("active"));

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

      titleBlock.appendChild(titleMatchday);
      titleBlock.appendChild(titleDates);
      container.appendChild(titleBlock);

      // Loop through matches
      matchday.matches.forEach(match => {
        const card = document.createElement('div');
        card.className = 'match-card';

        const homeScore = match.status != 'Played' ? '' : match.home_score;
        const awayScore = match.status != 'Played' ? '' : match.away_score;
        const venue = match.location != null ? match.location : '';
        const winnerIcon = match.status != 'Played' ? '' : '🏆';

        //
        // <div class="winner" style="font-size: 0.6em">${match.away_score > match.home_score ? winnerIcon : ''}</div>

        card.innerHTML = `
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

        containerBlock.appendChild(card);

        container.appendChild(containerBlock);
      });
    });
  });
}

export async function loadStandings(containerSelector = '.cards-container', tournamentId = 1) {
  const res = await fetch('data/tournaments.json');
  const tournaments = await res.json();

  const msg = document.querySelector('messages');
  // const mess = document.createElement('div')
  // mess.innerHTML = '<p>Entering LoadStanings</p>';
  // msg.appendChild(mess);

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

    /*
    const standingsTableHeadRow1 = standingsTableHead.insertRow();

    const headerTitles1 = ["", "", "", "Βαθμοί",
      "Εντ", "Εκτ", "Α", "Ν", "Ι", "Η",
      "Γκολ<br>Υπέρ", "Γκολ<br>Κατά", "Γκολ<br>Διαφ.",
      "ΓκΥΕν", "ΓκΚΕν", "ΓκΔΕν",
      "ΓκΥΕκ", "ΓκΚΕκ", "ΓκΔΕκ"];

    standingsTableHeadRow1.insertCell();
    standingsTableHeadRow1.insertCell();
    standingsTableHeadRow1.insertCell();

    Array.from(standingsTableHeadRow1.cells).forEach(cell => {
      cell.style.border = '0px';
      cell.style.padding = '0px 0px -2px 0px';
      cell.style.margin = '0px 0px -2px 0px';
    });

    const headCell1 = standingsTableHeadRow1.insertCell();
    headCell1.style.border = '0px';
    headCell1.style.padding = '0px';
    headCell1.style.margin = '0px';
    headCell1.innerHTML = 'Βαθμολογία';
    */

    /*
    const standingsTableHeadRow = standingsTableHead.insertRow();
    const headerTitles = ["#", "", "Ομάδα", "Συν",
      "Εντ", "Εκτ", "Α", "Ν", "Ι", "Η",
      "Γκολ<br>Υπέρ", "Γκολ<br>Κατά", "Γκολ<br>Διαφ.",
      "ΓκΥΕν", "ΓκΚΕν", "ΓκΔΕν",
      "ΓκΥΕκ", "ΓκΚΕκ", "ΓκΔΕκ"];
    // ["Position", "Badge", "Team",
    //   "Points", "PtsH", "PtsA", "Plays", "Wins", "Draws", "Loses",
    //   "GF", "GA", "GD", "GFH", "GAH", "GDH", "GFA", "GAA", "GDA"];
    for (let i = 0; i < headerTitles.length; i++) {
      const headCell = standingsTableHeadRow.insertCell();
      headCell.innerHTML = headerTitles[i];
    }
    const standingRecValNames = ["Position", "TeamBadge", "TeamName", "Points",
      "PtsH", "PtsA", "Plays", "Wins", "Draws", "Loses",
      "GF", "GA", "GD", "GFH", "GAH", "GDH", "GFA", "GAA", "GDA"];
    // Loop through standings entries
    tournament.standings.forEach(standingsRec => {
      const tableRow = standingsTable.insertRow();

      for (let i = 0; i < standingRecValNames.length; i++) {
        const valueCell = tableRow.insertCell();
        if (i != 2) {
          valueCell.style.textAlign = "right";
        }
        valueCell.innerHTML = standingsRec[standingRecValNames[i]];
      }
    });
    */

    // Shrinked version of Standings
    const standingsTableHeadRow = standingsTableHead.insertRow();
    const headerTitles = ["#", "Ομάδα", "", "Βαθμοί",
      "Π", "Ν", "Ι", "Η",
      "ΥΓ", "ΚΓ", "ΔΓ"];
    // ["Position", "Badge", "Team",
    //   "Points", "PtsH", "PtsA", "Plays", "Wins", "Draws", "Loses",
    //   "GF", "GA", "GD", "GFH", "GAH", "GDH", "GFA", "GAA", "GDA"];
    for (let i = 0; i < headerTitles.length; i++) {
      const headCell = standingsTableHeadRow.insertCell();
      headCell.innerHTML = headerTitles[i];
      headCell.style.textAlign = "right";
    }
    const badgeHCell = standingsTableHead.rows[0].cells[1];
    badgeHCell.colSpan = 2;
    badgeHCell.style.textAlign = "left";
    standingsTableHead.rows[0].deleteCell(2);

    const standingRecValNames = ["Position", "TeamBadge", "TeamName", "Points",
      "Plays", "Wins", "Draws", "Loses",
      "GF", "GA", "GD"];
    // Loop through standings entries
    tournament.standings.forEach(standingsRec => {
      const tableRow = standingsTable.insertRow();

      for (let i = 0; i < standingRecValNames.length; i++) {
        const valueCell = tableRow.insertCell();
        if (i == 1) {
          valueCell.innerHTML = '<img src=assets/' + standingsRec[standingRecValNames[i]] + ' class="team-badge"></img>';
          // valueCell.style.padding = "6px 0px 6px 6px"
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

// Optional: Format date from YYYY-MM-DD to DD/MM/YYYY
function formatDate(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}
