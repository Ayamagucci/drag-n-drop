/* ES modules —> ".js" file ext **
  (can enable "allowImportingTsExtensions" in TSConfig)

modify tsconfig + HTML script tag
  TSConfig
    • re-disable "outFile"
    • change "module" to ES2015+

  <script>
    • revert "src"
    • add [ type="module" ]
*/
import { ProjectForm } from './components/project-form';
import { ProjectList } from './components/project-list';

new ProjectForm();
new ProjectList('active');
new ProjectList('completed');