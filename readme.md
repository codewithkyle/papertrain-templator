# Developer Expectations

-   All Page Builder block handles **MUST** be at least 2 camel cased words
-   All Page Builder block directories and files **MUST** be the kebab case version of the blocks handle
-   All Page Builder blocks twig file **MUST** contain a custom element using the kebab case version of the blocks handle
-   All Page Builder block directories **MUST** contain an SCSS file
-   All Page Builder blocks **MUST** use the `data` variable to access the matrix block fields

# CMS Requirements

-   There **MUST** be a Demo Blocks entries structure with a depth of 2 and a handle of `demoBlocks`
-   Demo Block entries can be and entry type of Group (`pageBuilderGroup`) or Block (`pageBuilderBlock`)
-   Demo Block entires **MUST** have no more or less than 1 block per entry
-   Demo Block section access **SHOULD** be restricted (admins only)
-   Page Builder matrix **MUST** be a matrix field with the handle of `pageBuilder`
-   The `general.php` file **MUST** contain the `cpTrigger` value
-   The field handle `ptBlockType` is **RESERVED**
