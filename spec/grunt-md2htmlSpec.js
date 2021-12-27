const grunt = require('grunt');
describe('md2html suite', function () {
    it('md2html:one_file', function () {
        const actFile1 = grunt.file.read('tmp/one_file/output.html'),
            expectedFile1 = grunt.file.read('spec/expected/one_file/output.html');
        expect(actFile1).toEqual(expectedFile1);
    });

    it('md2html:multiple_files', function () {
        const actFile1 = grunt.file.read('tmp/multiple_files/file1.html'),
            expectedFile1 = grunt.file.read('spec/expected/multiple_files/file1.html'),
            actFile2 = grunt.file.read('tmp/multiple_files/file2.html'),
            expectedFile2 = grunt.file.read('spec/expected/multiple_files/file2.html'),
            actFile3 = grunt.file.read('tmp/multiple_files/subfolder/file3.html'),
            expectedFile3 = grunt.file.read('spec/expected/multiple_files/subfolder/file3.html');
        expect(actFile1).toEqual(expectedFile1);
        expect(actFile2).toEqual(expectedFile2);
        expect(actFile3).toEqual(expectedFile3);
    });

    it('md2html:includes', function () {
        const actFile1 = grunt.file.read('tmp/includes/index.html'),
            expectedFile1 = grunt.file.read('spec/expected/includes/index.html');

        expect(actFile1).toEqual(expectedFile1);
    });

    it('md2html:highlight', function () {
        const actFile1 = grunt.file.read('tmp/highlight/output.html'),
            expectedFile1 = grunt.file.read('spec/expected/highlight/output.html');
        expect(actFile1).toEqual(expectedFile1);
    });

    it('md2html:highlight_compressed', function () {
        const actFile1 = grunt.file.read('tmp/highlight/output_compressed.html'),
            expectedFile1 = grunt.file.read('spec/expected/highlight/output_compressed.html');
        expect(actFile1).toEqual(expectedFile1);
    });

    it('md2html:underscoreTemplating', function () {
        const actFile1 = grunt.file.read('tmp/underscore_test/output.html'),
            expectedFile1 = grunt.file.read('spec/expected/underscore_test/output.html');

        expect(actFile1).toEqual(expectedFile1);
    });

    it('md2html:plantuml_local', function () {
        const actFile1 = grunt.file.read('tmp/plantuml/output.html'),
            expectedFile1 = grunt.file.read('spec/expected/plantuml/output.html');

        expect(actFile1).toEqual(expectedFile1);
        expect(actFile1).toBeTruthy(grunt.file.exists('tmp/plantuml/myimage.png'));
    });

    it('md2html:plantuml_remote', function () {
        const actFile1 = grunt.file.read('tmp/plantuml/output-server.html'),
            expectedFile1 = grunt.file.read('spec/expected/plantuml/output-server.html');
        expect(actFile1).toEqual(expectedFile1);
        expect(actFile1).toBeTruthy(grunt.file.exists('tmp/plantuml/myimage-remote.png'));
    });

    describe('md2html:template_vars', function () {
        it('single file, no layout', function () {
            const actFile1 = grunt.file.read('tmp/template-vars/one_to_one.html'),
                expectedFile1 = grunt.file.read('spec/expected/template-vars/one_to_one.html');
            expect(actFile1).toEqual(expectedFile1);
        });
        it('multiple files to one, no layout', function () {
            const actFile1 = grunt.file.read('tmp/template-vars/multiple.html'),
                expectedFile1 = grunt.file.read('spec/expected/template-vars/multiple.html');
            expect(actFile1).toEqual(expectedFile1);
        });
        it('single file, with layout', function () {
            const actFile1 = grunt.file.read('tmp/template-vars/single-layout.html'),
                expectedFile1 = grunt.file.read('spec/expected/template-vars/single-layout.html');
            expect(actFile1).toEqual(expectedFile1);
        });
        it('multiple files, with layout', function () {
            const actFile1 = grunt.file.read('tmp/template-vars/multiple-layout.html'),
                expectedFile1 = grunt.file.read('spec/expected/template-vars/multiple-layout.html');
            expect(actFile1).toEqual(expectedFile1);
        });
    });
});
