/**
 * Documentation: http://docs.azk.io/Azkfile.js
 */
// Adds the systems that shape your system
systems({
  ebase: {
    // Dependent systems
    depends: ["mysql"],
    // More images:  http://images.azk.io
    image: {"docker": "azukiapp/php-fpm"},
    workdir: "/azk/#{manifest.dir}",
    shell: "/bin/bash",
    wait: 20,
    mounts: {
      '/azk/#{manifest.dir}': path("."),
    },
    scalable: {"default": 1},
    http: {
      domains: [
        "#{env.HOST_DOMAIN}",
        "#{env.HOST_IP}",
        "#{system.name}.#{azk.default_domain}"
      ]
    },
    ports: {
      // exports global variables
      http: "80/tcp",
    },
    envs: {
      // Make sure that the PORT value is the same as the one
      // in ports/http below, and that it's also the same
      // if you're setting it in a .env file
      APP_DIR: "/azk/#{manifest.dir}",
    },
  },
  "phpmyadmin": {
    depends: ["mysql"],
    image: { docker: "reduto/phpmyadmin" },
    wait: {retry: 20, timeout: 1000},
    scalable: {default: 1, limit: 1},
    http: {
      domains: [
        "#{system.name}.#{env.HOST_DOMAIN}",
        "#{system.name}.#{azk.default_domain}"
      ]
    },
    ports: {
      http: "80/tcp",
    },
  },
  "mysql": {
    // More info about mysql image: http://images.azk.io/#/mysql?from=docs-full_example
    image: {"docker": "azukiapp/mysql:5.7"},
    shell: "/bin/bash",
    wait: 25,
    mounts: {
      '/var/lib/mysql': persistent("mysql_data"),
      // to clean mysql data, run:
      // $ azk shell mysql -c "rm -rf /var/lib/mysql/*"
    },
    ports: {
      // exports global variables: "#{net.port.data}"
      // data: "#{net.port.data}",
      data: "3306:3306/tcp", //Repete-se a porta para fixa-la
    },
    envs: {
      // set instances variables
      MYSQL_USER         : "ebase",
      MYSQL_PASSWORD     : "ebase",
      MYSQL_DATABASE     : "#{manifest.dir}",
      MYSQL_ROOT_PASSWORD: "ebase",
    },
    export_envs: {
      MYSQL_USER    : "#{envs.MYSQL_USER}",
      MYSQL_PASSWORD: "#{envs.MYSQL_PASSWORD}",
      MYSQL_HOST    : "#{net.host}",
      MYSQL_PORT    : "#{net.port.data}",
      MYSQL_DATABASE: "#{envs.MYSQL_DATABASE}",
    },
  },
  "deploy": {
    image: {"docker": "azukiapp/deploy-digitalocean"},
    mounts: {
      "/azk/deploy/src" :    path("."),
      "/azk/deploy/.ssh":    path("#{env.HOME}/.ssh"),
      "/azk/deploy/.config": persistent("deploy-config"),
    },
    scalable: {"default": 0, "limit": 0},
  },
  envs: {
    // Adicione aqui as opções de configuração do deploy
    BOX_SIZE: "512mb", //Capacidade do Droplet (512mb, 1gb, 2gb
    BOX_NAME: "ebase", //Nome do droplet
  },
});

// Sets a default system (to use: start, stop, status, scale)
setDefault("ebase");
