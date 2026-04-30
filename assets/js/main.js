const pokemonList = document.getElementById('pokemonList');
const loadMoreButton = document.getElementById('loadMoreButton');
const typeFilter = document.getElementById('typeFilter');
const regionFilter = document.getElementById('regionFilter');
const searchInput = document.getElementById('searchInput');
const clearButton = document.getElementById('clearButton');
const pokemonCount = document.getElementById('pokemonCount');
const loadingState = document.getElementById('loadingState');
const emptyState = document.getElementById('emptyState');
const modalRoot = document.getElementById('modalRoot');
const teamSection = document.getElementById('teamSection');
const regionTitle = document.getElementById('regionTitle');

const itemsPerPage = 12;

let allPokemons = [];
let currentPage = 1;
let currentRegionId = 1;
let isLoading = false;

const regions = {
  1: {
    name: 'Kanto',
    generation: 'Generation I',
    teamTitle: 'Popular Kanto Team',
    teamDescription:
      'A classic and balanced Kanto team with iconic Pokémon from the first generation.',
    team: ['venusaur', 'charizard', 'blastoise', 'pikachu', 'gengar', 'dragonite'],
  },
  2: {
    name: 'Johto',
    generation: 'Generation II',
    teamTitle: 'Popular Johto Team',
    teamDescription:
      'A strong Johto team with starters, electric coverage, dark typing and a pseudo-legendary.',
    team: ['typhlosion', 'feraligatr', 'meganium', 'ampharos', 'umbreon', 'tyranitar'],
  },
  3: {
    name: 'Hoenn',
    generation: 'Generation III',
    teamTitle: 'Popular Hoenn Team',
    teamDescription:
      'A powerful Hoenn team with strong offensive presence, coverage and late-game options.',
    team: ['swampert', 'gardevoir', 'breloom', 'manectric', 'flygon', 'metagross'],
  },
  4: {
    name: 'Sinnoh',
    generation: 'Generation IV',
    teamTitle: 'Popular Sinnoh Team',
    teamDescription:
      'A Sinnoh team with very common story and battle choices from Generation IV.',
    team: ['infernape', 'luxray', 'staraptor', 'garchomp', 'lucario', 'roserade'],
  },
  5: {
    name: 'Unova',
    generation: 'Generation V',
    teamTitle: 'Popular Unova Team',
    teamDescription:
      'A Unova team focused on power, type variety and strong final evolutions.',
    team: ['samurott', 'excadrill', 'krookodile', 'chandelure', 'haxorus', 'hydreigon'],
  },
  6: {
    name: 'Kalos',
    generation: 'Generation VI',
    teamTitle: 'Popular Kalos Team',
    teamDescription:
      'A Kalos team with speed, offensive pressure and versatile type coverage.',
    team: ['greninja', 'talonflame', 'hawlucha', 'noivern', 'sylveon', 'goodra'],
  },
  7: {
    name: 'Alola',
    generation: 'Generation VII',
    teamTitle: 'Popular Alola Team',
    teamDescription:
      'A balanced Alola team with starters, defensive options and strong attackers.',
    team: ['decidueye', 'incineroar', 'primarina', 'vikavolt', 'toxapex', 'kommo-o'],
  },
  8: {
    name: 'Galar',
    generation: 'Generation VIII',
    teamTitle: 'Popular Galar Team',
    teamDescription:
      'A modern Galar team with strong offensive and defensive Pokémon from Generation VIII.',
    team: ['cinderace', 'rillaboom', 'inteleon', 'corviknight', 'dragapult', 'grimmsnarl'],
  },
  9: {
    name: 'Paldea',
    generation: 'Generation IX',
    teamTitle: 'Popular Paldea Team',
    teamDescription:
      'A Paldea team with strong Generation IX Pokémon and good overall type coverage.',
    team: ['meowscarada', 'skeledirge', 'quaquaval', 'kilowattrel', 'baxcalibur', 'kingambit'],
  },
};

function padNumber(number) {
  return String(number).padStart(3, '0');
}

function normalizeText(text) {
  return String(text).toLowerCase().trim();
}

function formatNameForUI(name) {
  return String(name)
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getStatPercentage(value) {
  const maxStat = 160;
  return Math.min((value / maxStat) * 100, 100);
}

function setLoading(status) {
  isLoading = status;
  loadingState.classList.toggle('hidden', !status);
  loadMoreButton.disabled = status;
}

function getCurrentRegion() {
  return regions[currentRegionId];
}

function updateRegionTitle() {
  const region = getCurrentRegion();
  regionTitle.textContent = `${region.name} Region`;
}

function convertPokemonToCard(pokemon) {
  return `
    <li class="pokemon-card ${pokemon.type}" data-id="${pokemon.number}">
      <div class="card-top">
        <span class="pokemon-number">#${padNumber(pokemon.number)}</span>
        <span class="pokemon-main-type">${pokemon.type}</span>
      </div>

      <div class="pokemon-image-wrapper">
        <img src="${pokemon.photo}" alt="${pokemon.name}" loading="lazy">
      </div>

      <div class="pokemon-info">
        <h3>${pokemon.name}</h3>

        <ol class="types">
          ${pokemon.types
            .map((type) => `<li class="type ${type}">${type}</li>`)
            .join('')}
        </ol>
      </div>

      <button class="details-button" type="button">
        View Details
      </button>
    </li>
  `;
}

function getFilteredPokemons() {
  const selectedType = typeFilter.value;
  const searchValue = normalizeText(searchInput.value);

  return allPokemons.filter((pokemon) => {
    const matchesType =
      selectedType === 'all' || pokemon.types.includes(selectedType);

    const matchesSearch =
      !searchValue ||
      normalizeText(pokemon.name).includes(searchValue) ||
      String(pokemon.number).includes(searchValue);

    return matchesType && matchesSearch;
  });
}

function renderPokemonList() {
  const filteredPokemons = getFilteredPokemons();
  const visibleLimit = currentPage * itemsPerPage;
  const visiblePokemons = filteredPokemons.slice(0, visibleLimit);

  pokemonList.innerHTML = visiblePokemons.map(convertPokemonToCard).join('');

  emptyState.classList.toggle('hidden', filteredPokemons.length > 0);

  const region = getCurrentRegion();

  pokemonCount.textContent =
    `${visiblePokemons.length} of ${filteredPokemons.length} Pokémon displayed from ${region.name}`;

  if (visiblePokemons.length >= filteredPokemons.length) {
    loadMoreButton.classList.add('hidden');
  } else {
    loadMoreButton.classList.remove('hidden');
  }

  document.querySelectorAll('.pokemon-card').forEach((card) => {
    card.addEventListener('click', () => {
      const id = card.dataset.id;

      const pokemon = allPokemons.find(
        (item) => String(item.number) === String(id)
      );

      if (pokemon) {
        openPokemonModal(pokemon);
      }
    });
  });
}

function resetPaginationAndRender() {
  currentPage = 1;
  renderPokemonList();
}

function renderTeamSection() {
  const region = getCurrentRegion();

  teamSection.innerHTML = `
    <div class="team-card">
      <div class="team-header">
        <div>
          <span class="section-label">Popular Regional Team</span>
          <h2>${region.teamTitle}</h2>
          <p>${region.teamDescription}</p>
        </div>

        <div class="team-generation">
          <strong>${region.name}</strong>
          <span>${region.generation}</span>
        </div>
      </div>

      <div class="team-list">
        ${region.team
          .map((pokemonName) => {
            const pokemon = allPokemons.find(
              (item) => normalizeText(item.name) === normalizeText(formatNameForUI(pokemonName))
            );

            const image = pokemon ? pokemon.photo : '';
            const number = pokemon ? `#${padNumber(pokemon.number)}` : '';

            return `
              <button class="team-pokemon" type="button" data-pokemon="${pokemonName}">
                <div class="team-pokemon-image">
                  ${
                    image
                      ? `<img src="${image}" alt="${formatNameForUI(pokemonName)}">`
                      : `<span>?</span>`
                  }
                </div>

                <div>
                  <strong>${formatNameForUI(pokemonName)}</strong>
                  <span>${number}</span>
                </div>
              </button>
            `;
          })
          .join('')}
      </div>

      <p class="team-note">
        This team is a curated regional suggestion for portfolio and study purposes.
        PokéAPI does not provide official team usage rankings.
      </p>
    </div>
  `;

  document.querySelectorAll('.team-pokemon').forEach((button) => {
    button.addEventListener('click', () => {
      openPokemonFromTeam(button.dataset.pokemon);
    });
  });
}

async function openPokemonFromTeam(pokemonName) {
  const localPokemon = allPokemons.find(
    (item) => normalizeText(item.name) === normalizeText(formatNameForUI(pokemonName))
  );

  if (localPokemon) {
    openPokemonModal(localPokemon);
    return;
  }

  try {
    setLoading(true);

    const pokemon = await pokeApi.getPokemonByNameOrId(pokemonName);
    openPokemonModal(pokemon);
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
}

async function loadRegion(regionId) {
  try {
    setLoading(true);

    currentRegionId = Number(regionId);
    currentPage = 1;

    searchInput.value = '';
    typeFilter.value = 'all';

    updateRegionTitle();

    allPokemons = await pokeApi.getPokemonByGeneration(currentRegionId);

    renderTeamSection();
    renderPokemonList();
  } catch (error) {
    pokemonCount.textContent = 'Error loading region.';
    console.error(error);
  } finally {
    setLoading(false);
  }
}

function openPokemonModal(pokemon) {
  const abilitiesHtml = pokemon.abilities
    .map((ability) => `<span>${ability}</span>`)
    .join('');

  const movesHtml = pokemon.moves
    .map((move) => `<span>${move}</span>`)
    .join('');

  const statsHtml = pokemon.stats
    .map((stat) => {
      const percentage = getStatPercentage(stat.value);

      return `
        <div class="stat-row">
          <div class="stat-name">${stat.name}</div>

          <div class="stat-bar-wrapper">
            <div class="stat-bar-fill" style="width: ${percentage}%"></div>
          </div>

          <strong>${stat.value}</strong>
        </div>
      `;
    })
    .join('');

  modalRoot.innerHTML = `
    <div class="modal-overlay">
      <article class="pokemon-modal ${pokemon.type}">
        <button class="modal-close" type="button" aria-label="Close modal">
          ×
        </button>

        <div class="modal-header">
          <div>
            <span>#${padNumber(pokemon.number)}</span>
            <h2>${pokemon.name}</h2>

            <ol class="types">
              ${pokemon.types
                .map((type) => `<li class="type ${type}">${type}</li>`)
                .join('')}
            </ol>
          </div>

          <img src="${pokemon.photo}" alt="${pokemon.name}">
        </div>

        <div class="modal-body">
          <div class="modal-metrics">
            <div>
              <span>Height</span>
              <strong>${pokemon.height.toFixed(1)} m</strong>
            </div>

            <div>
              <span>Weight</span>
              <strong>${pokemon.weight.toFixed(1)} kg</strong>
            </div>

            <div>
              <span>Base XP</span>
              <strong>${pokemon.baseExperience || 'N/A'}</strong>
            </div>
          </div>

          <div class="abilities-section">
            <h3>Abilities</h3>

            <div class="chip-list">
              ${abilitiesHtml}
            </div>
          </div>

          <div class="stats-section">
            <h3>Base Stats</h3>
            ${statsHtml}
          </div>

          <div class="moves-section">
            <h3>Main Moves</h3>

            <div class="chip-list moves-list">
              ${movesHtml}
            </div>
          </div>
        </div>
      </article>
    </div>
  `;

  const overlay = document.querySelector('.modal-overlay');
  const closeButton = document.querySelector('.modal-close');

  closeButton.addEventListener('click', closeModal);

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      closeModal();
    }
  });
}

function closeModal() {
  modalRoot.innerHTML = '';
}

function clearFilters() {
  searchInput.value = '';
  typeFilter.value = 'all';
  resetPaginationAndRender();
}

regionFilter.addEventListener('change', () => {
  loadRegion(regionFilter.value);
});

typeFilter.addEventListener('change', resetPaginationAndRender);

searchInput.addEventListener('input', resetPaginationAndRender);

clearButton.addEventListener('click', clearFilters);

loadMoreButton.addEventListener('click', () => {
  if (isLoading) return;

  currentPage += 1;
  renderPokemonList();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeModal();
  }
});

loadRegion(currentRegionId);