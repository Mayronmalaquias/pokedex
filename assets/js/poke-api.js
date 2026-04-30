const pokeApi = {};
const baseUrl = 'https://pokeapi.co/api/v2';

function formatPokemonName(name) {
  return String(name)
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getResourceIdFromUrl(url) {
  const parts = url.split('/').filter(Boolean);
  return Number(parts[parts.length - 1]);
}

function getBestPokemonImage(pokeDetail) {
  return (
    pokeDetail.sprites.other['official-artwork'].front_default ||
    pokeDetail.sprites.other.dream_world.front_default ||
    pokeDetail.sprites.front_default ||
    ''
  );
}

function convertPokeApiDetailToPokemon(pokeDetail) {
  const pokemon = new Pokemon();

  const types = pokeDetail.types.map((typeSlot) => typeSlot.type.name);
  const [mainType] = types;

  pokemon.number = pokeDetail.id;
  pokemon.name = formatPokemonName(pokeDetail.name);
  pokemon.type = mainType;
  pokemon.types = types;
  pokemon.photo = getBestPokemonImage(pokeDetail);
  pokemon.height = pokeDetail.height / 10;
  pokemon.weight = pokeDetail.weight / 10;
  pokemon.baseExperience = pokeDetail.base_experience;

  pokemon.abilities = pokeDetail.abilities.map((abilitySlot) =>
    formatPokemonName(abilitySlot.ability.name)
  );

  pokemon.stats = pokeDetail.stats.map((statItem) => ({
    name: formatPokemonName(statItem.stat.name),
    value: statItem.base_stat,
  }));

  pokemon.moves = pokeDetail.moves
    .slice(0, 18)
    .map((moveItem) => formatPokemonName(moveItem.move.name));

  return pokemon;
}

pokeApi.getPokemonByNameOrId = async (searchValue) => {
  const value = String(searchValue).trim().toLowerCase();

  const response = await fetch(`${baseUrl}/pokemon/${value}`);

  if (!response.ok) {
    throw new Error(`Pokémon not found: ${value}`);
  }

  const data = await response.json();

  return convertPokeApiDetailToPokemon(data);
};

pokeApi.getPokemonByGeneration = async (generationId) => {
  const response = await fetch(`${baseUrl}/generation/${generationId}`);

  if (!response.ok) {
    throw new Error('Could not load generation.');
  }

  const generation = await response.json();

  const species = generation.pokemon_species
    .map((item) => ({
      name: item.name,
      id: getResourceIdFromUrl(item.url),
    }))
    .sort((a, b) => a.id - b.id);

  const requests = species.map((item) =>
    pokeApi.getPokemonByNameOrId(item.name).catch(() => null)
  );

  const results = await Promise.all(requests);

  return results
    .filter(Boolean)
    .sort((a, b) => a.number - b.number);
};