import parser from 'yargs-parser'

export default function parseArgs() {
  return parser(Bun.argv.slice(2), { number: ['force-persona'] })
}