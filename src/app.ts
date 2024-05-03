/* ES modules —> ".js" file ext **
  (NOTE: enable "allowImportingTsExtensions" to use ".ts")

modify tsconfig + HTML <script> tag
  TSConfig
    • re-disable "outFile"
    • change "module" to ES2015+

  <script>
    • revert "src"
    • add [ type="module" ]
*/
import { ProjectForm } from './components/ProjectForm';
import { ProjectList } from './components/ProjectList';

new ProjectForm();
new ProjectList('active');
new ProjectList('completed');

/* NOTE: each import —> HTTP req in browser
  (REC bundler e.g. Webpack)
*/