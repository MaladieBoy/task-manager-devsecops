pipeline {
    agent any

    tools {
        jdk 'jdk25'
        maven 'maven-3.9.11'
    }

    environment {
        DOCKER_IMAGE = 'xxmaladiexx/task-manager'
        SONAR_PROJECT_KEY = 'task-manager'
        KUBECONFIG = '/var/lib/jenkins/.kube/config'
    }

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    stages {
        stage('Build and Unit Tests') {
            steps {
                sh 'mvn clean verify'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh 'mvn org.sonarsource.scanner.maven:sonar-maven-plugin:5.5.0.6356:sonar -Dsonar.projectKey=$SONAR_PROJECT_KEY'
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('OWASP Dependency-Check') {
            steps {
                withCredentials([string(
                    credentialsId: 'nvd-api-key',
                    variable: 'NVD_API_KEY'
                )]) {
                    sh '''
                        mkdir -p dependency-check-report dependency-check-data

                        docker run --rm \
                          --user "$(id -u):$(id -g)" \
                          -v "$WORKSPACE:/src:ro" \
                          -v "$WORKSPACE/dependency-check-report:/report" \
                          -v "$WORKSPACE/dependency-check-data:/usr/share/dependency-check/data" \
                          owasp/dependency-check:latest \
                          --project "Task Manager" \
                          --scan /src/pom.xml \
                          --nvdApiKey "$NVD_API_KEY" \
                          --nvdApiDelay 6000 \
                          --format HTML \
                          --format XML \
                          --out /report
                    '''
                }
            }
        }

        stage('Docker Build') {
            steps {
                sh 'docker build -t $DOCKER_IMAGE:$BUILD_NUMBER .'
            }
        }

        stage('Trivy Image Scan') {
            steps {
                sh '''
                    trivy image \
                      --scanners vuln \
                      --severity HIGH,CRITICAL \
                      --exit-code 0 \
                      --format table \
                      --output trivy-report.txt \
                      "$DOCKER_IMAGE:$BUILD_NUMBER"
                '''
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'DOCKERHUB_USER',
                    passwordVariable: 'DOCKERHUB_TOKEN'
                )]) {
                    sh '''
                        echo "$DOCKERHUB_TOKEN" | docker login \
                          --username "$DOCKERHUB_USER" \
                          --password-stdin

                        docker push "$DOCKER_IMAGE:$BUILD_NUMBER"
                        docker logout
                    '''
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh '''
                    kubectl set image deployment/task-manager \
                      task-manager="$DOCKER_IMAGE:$BUILD_NUMBER"

                    kubectl rollout status deployment/task-manager \
                      --timeout=180s
                '''
            }
        }

        stage('OWASP ZAP DAST Scan') {
            steps {
                sh '''
                    MINIKUBE_IP=$(minikube ip)

                    /usr/share/zaproxy/zap.sh \
                      -cmd \
                      -silent \
                      -quickurl "http://${MINIKUBE_IP}:30080" \
                      -quickout "$WORKSPACE/zap-report.html"
                '''
            }
        }
    }

    post {
        always {
            junit allowEmptyResults: true,
                  testResults: 'target/surefire-reports/*.xml'

            archiveArtifacts(
                artifacts: 'dependency-check-report/**,trivy-report.txt,zap-report.html',
                allowEmptyArchive: true
            )
        }
    }
}
