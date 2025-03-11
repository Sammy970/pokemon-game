# Pokémon Battle Game Specification

## Project Overview

A turn-based 1v1 Pokémon battle game inspired by the mechanics of Gen 1-3 games. Players select a single Pokémon and engage in turn-based combat until one Pokémon faints.

## Technology Stack

- **Frontend**: react-ts vite
- **Language**: TypeScript
- **State Management**: Redux Toolkit
- **Multiplayer**: WebSocket (Socket.io)
- **API**: PokéAPI for Pokémon data
- **Styling**: Tailwind CSS

## Battle System Mechanics

### Core Battle Flow

1. Both players select one Pokémon from available options
2. Each turn, both players select a move
3. Turn order determined by Speed stat (higher Speed goes first)
4. Damage calculation considers:
   - Move power
   - Attacker's Attack/Sp. Attack stat
   - Defender's Defense/Sp. Defense stat
   - Type effectiveness multipliers
   - STAB (Same Type Attack Bonus)
   - Critical hit chance (1/16 in Gen 1-3)
5. Battle continues until one Pokémon's HP reaches zero