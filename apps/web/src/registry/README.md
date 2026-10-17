# Registry de funcionalidades administrativas

O registry associa um `slug` do catálogo Shared e um modo de tela a um componente React. Ele não
concede autorização: a sessão e a API continuam sendo a fonte de verdade para permissões.

Bindings só existem para superfícies administrativas roteáveis. Rotas públicas e de autenticação
não participam do registry.
