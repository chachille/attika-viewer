export async function loadMatches(containerSelector = '.cards-container') {
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

        container.appendChild(card);
      });
    });
  });
}

// Optional: Format date from YYYY-MM-DD to DD/MM/YYYY
function formatDate(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}
