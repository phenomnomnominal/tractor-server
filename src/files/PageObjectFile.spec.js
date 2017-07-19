/* global describe:true, it:true */

// Utilities:
import chai from 'chai';
import dirtyChai from 'dirty-chai';
import path from 'path';
import Promise from 'bluebird';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

// Test setup:
const expect = chai.expect;
chai.use(dirtyChai);
chai.use(sinonChai);

// Dependencies:
import { JavaScriptFile } from './JavaScriptFile';
import { StepDefinitionFile } from './StepDefinitionFile';
import { TractorError } from 'tractor-error-handler';
import { File, FileStructure } from 'tractor-file-structure';

// Under test:
import { PageObjectFile } from './PageObjectFile';

describe('server/files: PageObjectFile:', () => {
    describe('PageObjectFile constructor:', () => {
        it('should create a new PageObjectFile', () => {
            let fileStructure = new FileStructure(path.join(path.sep, 'file-structure'));
            let filePath = path.join(path.sep, 'file-structure', 'directory', 'file');

            let file = new PageObjectFile(filePath, fileStructure);

            expect(file).to.be.an.instanceof(PageObjectFile);
        });

        it('should inherit from JavaScriptFile', () => {
            let fileStructure = new FileStructure(path.join(path.sep, 'file-structure'));
            let filePath = path.join(path.sep, 'file-structure', 'directory', 'file');

            let file = new PageObjectFile(filePath, fileStructure);

            expect(file).to.be.an.instanceof(JavaScriptFile);
        });

        it('should have a `type` of "page-objects"', () => {
            let fileStructure = new FileStructure(path.join(path.sep, 'file-structure'));
            let filePath = path.join(path.sep, 'file-structure', 'directory', 'file');

            let file = new PageObjectFile(filePath, fileStructure);

            expect(file.type).to.equal('page-objects');
        });

        it('should have an `extension` of ".po.js"', () => {
            let fileStructure = new FileStructure(path.join(path.sep, 'file-structure'));
            let filePath = path.join(path.sep, 'file-structure', 'directory', 'file');

            let file = new PageObjectFile(filePath, fileStructure);

            expect(file.extension).to.equal('.po.js');
        });
    });

    describe('PageObjectFile.delete:', () => {
        it('should delete the file from disk', () => {
            let fileStructure = new FileStructure(path.join(path.sep, 'file-structure'));
            let filePath = path.join(path.sep, 'file-structure', 'directory', 'file.po.js');

            sinon.stub(File.prototype, 'delete').returns(Promise.resolve());

            let file = new PageObjectFile(filePath, fileStructure);

            return file.delete()
            .then(() => {
                expect(File.prototype.delete).to.have.been.called();
            })
            .finally(() => {
                File.prototype.delete.restore();
            });
        });

        it('should delete the list of references to the file', () => {
            let fileStructure = new FileStructure(path.join(path.sep, 'file-structure'));
            let filePath = path.join(path.sep, 'file-structure', 'directory', 'file.po.js');
            fileStructure.references[filePath] = [];

            sinon.stub(File.prototype, 'delete').returns(Promise.resolve());

            let file = new PageObjectFile(filePath, fileStructure);

            return file.delete()
            .then(() => {
                expect(fileStructure.references[filePath]).to.be.undefined();
            })
            .finally(() => {
                File.prototype.delete.restore();
            });
        });

        it('should throw an error if the page object is referenced by other files', () => {
            let fileStructure = new FileStructure(path.join(path.sep, 'file-structure'));
            let filePath = path.join(path.sep, 'file-structure', 'directory', 'file.po.js');
            fileStructure.references[filePath] = ['fake reference'];

            sinon.stub(File.prototype, 'delete').returns(Promise.resolve());

            let file = new PageObjectFile(filePath, fileStructure);

            return file.delete()
            .catch(e => {
                expect(e).to.deep.equal(new TractorError(`Cannot delete ${file.path} as it is referenced by another file.`));
            })
            .finally(() => {
                File.prototype.delete.restore();
            });
        });

        it('should not throw an error if `isMove` is true', () => {
            let fileStructure = new FileStructure(path.join(path.sep, 'file-structure'));
            let filePath = path.join(path.sep, 'file-structure', 'directory', 'file.po.js');
            fileStructure.references[filePath] = [];

            sinon.stub(File.prototype, 'delete').returns(Promise.resolve());
            sinon.spy(Promise, 'reject');

            let file = new PageObjectFile(filePath, fileStructure);

            return file.delete({ isMove: true })
            .then(() => {
                expect(Promise.reject).to.not.have.been.called();
            })
            .finally(() => {
                File.prototype.delete.restore();
                Promise.reject.restore();
            });
        });
    });

    describe('PageObjectFile.move:', () => {
        it('should move the file', () => {
            let fileStructure = new FileStructure(path.join(path.sep, 'file-structure'));
            let filePath = path.join(path.sep, 'file-structure', 'directory', 'file.po.js');
            let file = new PageObjectFile(filePath, fileStructure);
            let newFilePath = path.join(path.sep, 'file-structure', 'directory', 'new file.po.js');
            let newFile = new PageObjectFile(newFilePath, fileStructure);

            sinon.stub(File.prototype, 'move').returns(Promise.resolve(newFile));
            sinon.stub(JavaScriptFile.prototype, 'save').returns(Promise.resolve());
            sinon.stub(JavaScriptFile.prototype, 'transformIdentifiers');
            sinon.stub(JavaScriptFile.prototype, 'transformMetadata');
            sinon.stub(Promise, 'map').returns(Promise.resolve());

            let update = {};
            let options = {};

            return file.move(update, options)
            .then(() => {
                expect(File.prototype.move).to.have.been.calledWith(update, options);
            })
            .finally(() => {
                File.prototype.move.restore();
                JavaScriptFile.prototype.save.restore();
                JavaScriptFile.prototype.transformIdentifiers.restore();
                JavaScriptFile.prototype.transformMetadata.restore();
                Promise.map.restore();
            });
        });

        it('should update the class name of the page object', () => {
            let fileStructure = new FileStructure(path.join(path.sep, 'file-structure'));
            let filePath = path.join(path.sep, 'file-structure', 'directory', 'file.po.js');
            let file = new PageObjectFile(filePath, fileStructure);
            let newFilePath = path.join(path.sep, 'file-structure', 'directory', 'new file.po.js');
            let newFile = new PageObjectFile(newFilePath, fileStructure);

            sinon.stub(File.prototype, 'move').returns(Promise.resolve(newFile));
            sinon.stub(JavaScriptFile.prototype, 'save').returns(Promise.resolve());
            sinon.stub(JavaScriptFile.prototype, 'transformIdentifiers');
            sinon.stub(JavaScriptFile.prototype, 'transformMetadata');
            sinon.stub(Promise, 'map').returns(Promise.resolve());

            let update = {};
            let options = {};

            return file.move(update, options)
            .then(() => {
                expect(newFile.transformIdentifiers).to.have.been.calledWith('File', 'NewFile', 'VariableDeclarator');
                expect(newFile.transformIdentifiers).to.have.been.calledWith('File', 'NewFile', 'FunctionExpression');
                expect(newFile.transformIdentifiers).to.have.been.calledWith('File', 'NewFile', 'MemberExpression MemberExpression');
                expect(newFile.transformIdentifiers).to.have.been.calledWith('File', 'NewFile', 'ReturnStatement');
            })
            .finally(() => {
                File.prototype.move.restore();
                JavaScriptFile.prototype.save.restore();
                JavaScriptFile.prototype.transformIdentifiers.restore();
                JavaScriptFile.prototype.transformMetadata.restore();
                Promise.map.restore();
            });
        });

        it('should update the class name of the page object in files that reference it', () => {
            let fileStructure = new FileStructure(path.join(path.sep, 'file-structure'));
            let filePath = path.join(path.sep, 'file-structure', 'directory', 'file.po.js');
            let file = new PageObjectFile(filePath, fileStructure);
            let newFilePath = path.join(path.sep, 'file-structure', 'directory', 'new file.po.js');
            let newFile = new PageObjectFile(newFilePath, fileStructure);
            let referenceFilePath = path.join(path.sep, 'file-structure', 'directory', 'reference file.step.js');
            let referenceFile = new StepDefinitionFile(referenceFilePath, fileStructure);
            fileStructure.references[filePath] = [referenceFile.path];

            sinon.stub(File.prototype, 'move').returns(Promise.resolve(newFile));
            sinon.stub(JavaScriptFile.prototype, 'save').returns(Promise.resolve());
            sinon.stub(JavaScriptFile.prototype, 'transformIdentifiers');
            sinon.stub(JavaScriptFile.prototype, 'transformMetadata');
            sinon.stub(StepDefinitionFile.prototype, 'transformRequirePaths');

            let update = {};
            let options = {};

            return file.move(update, options)
            .then(() => {
                expect(referenceFile.transformIdentifiers).to.have.been.calledWith('File', 'NewFile', 'VariableDeclarator');
                expect(referenceFile.transformIdentifiers).to.have.been.calledWith('File', 'NewFile', 'NewExpression');
            })
            .finally(() => {
                File.prototype.move.restore();
                JavaScriptFile.prototype.save.restore();
                JavaScriptFile.prototype.transformIdentifiers.restore();
                JavaScriptFile.prototype.transformMetadata.restore();
                StepDefinitionFile.prototype.transformRequirePaths.restore();
            });
        });

        it('should update the instance name of the page object in files that reference it', () => {
            let fileStructure = new FileStructure(path.join(path.sep, 'file-structure'));
            let filePath = path.join(path.sep, 'file-structure', 'directory', 'file.po.js');
            let file = new PageObjectFile(filePath, fileStructure);
            let newFilePath = path.join(path.sep, 'file-structure', 'directory', 'new file.po.js');
            let newFile = new PageObjectFile(newFilePath, fileStructure);
            let referenceFilePath = path.join(path.sep, 'file-structure', 'directory', 'reference file.step.js');
            let referenceFile = new StepDefinitionFile(referenceFilePath, fileStructure);
            fileStructure.references[filePath] = [referenceFile.path];

            sinon.stub(File.prototype, 'move').returns(Promise.resolve(newFile));
            sinon.stub(JavaScriptFile.prototype, 'save').returns(Promise.resolve());
            sinon.stub(JavaScriptFile.prototype, 'transformIdentifiers');
            sinon.stub(JavaScriptFile.prototype, 'transformMetadata');
            sinon.stub(StepDefinitionFile.prototype, 'transformRequirePaths');

            let update = {};
            let options = {};

            return file.move(update, options)
            .then(() => {
                expect(referenceFile.transformIdentifiers).to.have.been.calledWith('file', 'newFile', 'VariableDeclarator');
                expect(referenceFile.transformIdentifiers).to.have.been.calledWith('file', 'newFile', 'CallExpression MemberExpression');
            })
            .finally(() => {
                File.prototype.move.restore();
                JavaScriptFile.prototype.save.restore();
                JavaScriptFile.prototype.transformIdentifiers.restore();
                JavaScriptFile.prototype.transformMetadata.restore();
                StepDefinitionFile.prototype.transformRequirePaths.restore();
            });
        });

        it('should update the metadata of the page object in files that reference it', () => {
            let fileStructure = new FileStructure(path.join(path.sep, 'file-structure'));
            let filePath = path.join(path.sep, 'file-structure', 'directory', 'file.po.js');
            let file = new PageObjectFile(filePath, fileStructure);
            let newFilePath = path.join(path.sep, 'file-structure', 'directory', 'new file.po.js');
            let newFile = new PageObjectFile(newFilePath, fileStructure);
            let referenceFilePath = path.join(path.sep, 'file-structure', 'directory', 'reference file.step.js');
            let referenceFile = new StepDefinitionFile(referenceFilePath, fileStructure);
            fileStructure.references[filePath] = [referenceFile.path];

            sinon.stub(File.prototype, 'move').returns(Promise.resolve(newFile));
            sinon.stub(JavaScriptFile.prototype, 'save').returns(Promise.resolve());
            sinon.stub(JavaScriptFile.prototype, 'transformIdentifiers');
            sinon.stub(JavaScriptFile.prototype, 'transformMetadata');
            sinon.stub(StepDefinitionFile.prototype, 'transformRequirePaths');

            let update = {};
            let options = {};

            return file.move(update, options)
            .then(() => {
                expect(referenceFile.transformMetadata).to.have.been.calledWith('file', 'new file', 'page-objects');
            })
            .finally(() => {
                File.prototype.move.restore();
                JavaScriptFile.prototype.save.restore();
                JavaScriptFile.prototype.transformIdentifiers.restore();
                JavaScriptFile.prototype.transformMetadata.restore();
                StepDefinitionFile.prototype.transformRequirePaths.restore();
            });
        });

        it('should update the require path to the page object in files that reference it', () => {
            let fileStructure = new FileStructure(path.join(path.sep, 'file-structure'));
            let filePath = path.join(path.sep, 'file-structure', 'directory', 'file.po.js');
            let file = new PageObjectFile(filePath, fileStructure);
            let newFilePath = path.join(path.sep, 'file-structure', 'directory', 'new file.po.js');
            let newFile = new PageObjectFile(newFilePath, fileStructure);
            let referenceFilePath = path.join(path.sep, 'file-structure', 'directory', 'reference file.step.js');
            let referenceFile = new StepDefinitionFile(referenceFilePath, fileStructure);
            fileStructure.references[filePath] = [referenceFile.path];

            sinon.stub(File.prototype, 'move').returns(Promise.resolve(newFile));
            sinon.stub(JavaScriptFile.prototype, 'save').returns(Promise.resolve());
            sinon.stub(JavaScriptFile.prototype, 'transformIdentifiers');
            sinon.stub(JavaScriptFile.prototype, 'transformMetadata');
            sinon.stub(StepDefinitionFile.prototype, 'transformRequirePaths');

            let update = {};
            let options = {};

            return file.move(update, options)
            .then(() => {
                expect(referenceFile.transformRequirePaths).to.have.been.calledWith({
                    fromPath: referenceFilePath,
                    oldToPath: filePath,
                    newToPath: newFilePath
                });
            })
            .finally(() => {
                File.prototype.move.restore();
                JavaScriptFile.prototype.save.restore();
                JavaScriptFile.prototype.transformIdentifiers.restore();
                JavaScriptFile.prototype.transformMetadata.restore();
                StepDefinitionFile.prototype.transformRequirePaths.restore();
            });
        });

        it('should save any files that reference it', () => {
            let fileStructure = new FileStructure(path.join(path.sep, 'file-structure'));
            let filePath = path.join(path.sep, 'file-structure', 'directory', 'file.po.js');
            let file = new PageObjectFile(filePath, fileStructure);
            let newFilePath = path.join(path.sep, 'file-structure', 'directory', 'new file.po.js');
            let newFile = new PageObjectFile(newFilePath, fileStructure);
            let referenceFilePath = path.join(path.sep, 'file-structure', 'directory', 'reference file.step.js');
            let referenceFile = new StepDefinitionFile(referenceFilePath, fileStructure);
            fileStructure.references[filePath] = [referenceFile.path];

            sinon.stub(File.prototype, 'move').returns(Promise.resolve(newFile));
            sinon.stub(JavaScriptFile.prototype, 'save').returns(Promise.resolve());
            sinon.stub(JavaScriptFile.prototype, 'transformIdentifiers');
            sinon.stub(JavaScriptFile.prototype, 'transformMetadata');
            sinon.stub(StepDefinitionFile.prototype, 'transformRequirePaths');

            let update = {};
            let options = {};

            return file.move(update, options)
            .then(() => {
                expect(JavaScriptFile.prototype.save).to.have.been.calledOn(referenceFile);
            })
            .finally(() => {
                File.prototype.move.restore();
                JavaScriptFile.prototype.save.restore();
                JavaScriptFile.prototype.transformIdentifiers.restore();
                JavaScriptFile.prototype.transformMetadata.restore();
                StepDefinitionFile.prototype.transformRequirePaths.restore();
            });
        });

        it('should throw if updating references fails', () => {
            let fileStructure = new FileStructure(path.join(path.sep, 'file-structure'));
            let filePath = path.join(path.sep, 'file-structure', 'directory', 'file.po.js');
            let file = new PageObjectFile(filePath, fileStructure);
            let newFilePath = path.join(path.sep, 'file-structure', 'directory', 'new file.po.js');
            let newFile = new PageObjectFile(newFilePath, fileStructure);

            sinon.stub(File.prototype, 'move').returns(Promise.resolve(newFile));
            sinon.stub(JavaScriptFile.prototype, 'save').returns(Promise.resolve());
            sinon.stub(JavaScriptFile.prototype, 'transformIdentifiers');
            sinon.stub(JavaScriptFile.prototype, 'transformMetadata');
            sinon.stub(Promise, 'map').returns(Promise.reject());

            let update = {};
            let options = {};

            return file.move(update, options)
            .catch(e => {
                expect(e).to.deep.equal(new TractorError(`Could not update references after moving ${filePath}.`));
            })
            .finally(() => {
                File.prototype.move.restore();
                JavaScriptFile.prototype.save.restore();
                JavaScriptFile.prototype.transformIdentifiers.restore();
                JavaScriptFile.prototype.transformMetadata.restore();
                Promise.map.restore();
            });
        });
    });
});
