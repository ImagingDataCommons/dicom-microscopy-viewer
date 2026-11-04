const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')

jest.mock('ol/webgl/Helper', () => jest.fn(() => null), { virtual: true })

const dmv = require('./dicom-microscopy-viewer.js')

/**
 * Value members (const, class, function) of each exported namespace of the
 * type declarations, and the exported functions.
 */
const readDeclarations = () => {
  const file = path.join(__dirname, '../types/index.d.ts')
  const source = ts.createSourceFile(
    file,
    fs.readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  )
  const namespaces = {}
  const functions = []
  for (const statement of source.statements) {
    if (ts.isModuleDeclaration(statement)) {
      const members = []
      for (const member of statement.body.statements) {
        if (ts.isVariableStatement(member)) {
          for (const declaration of member.declarationList.declarations) {
            members.push(declaration.name.text)
          }
        } else if (
          ts.isClassDeclaration(member) ||
          ts.isFunctionDeclaration(member)
        ) {
          members.push(member.name.text)
        }
      }
      namespaces[statement.name.text] = members.sort()
    } else if (ts.isFunctionDeclaration(statement)) {
      functions.push(statement.name.text)
    }
  }
  return { namespaces, functions }
}

describe('type declarations', () => {
  it('declare exactly the exports of the library', () => {
    const { namespaces, functions } = readDeclarations()
    const runtimeNamespaces = {}
    const runtimeFunctions = []
    for (const [name, value] of Object.entries(dmv)) {
      if (typeof value === 'function') {
        runtimeFunctions.push(name)
      } else {
        runtimeNamespaces[name] = Object.keys(value).sort()
      }
    }
    expect(functions.sort()).toEqual(runtimeFunctions.sort())
    expect(namespaces).toEqual(runtimeNamespaces)
  })
})
