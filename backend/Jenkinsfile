pipeline {
    agent any

    environment {
        DOCKER_CREDENTIALS_ID = 'dockerhub-credentials-id'
        DOCKER_IMAGE = 'seansal/shodan-k8s-backend'
        IMAGE_TAG = "${env.BUILD_ID}"
    }

    stages {
        stage('Checkout') {
            steps {
                dir('backend') {
                    checkout scm
                }
            }
        }

        stage('Check for Backend Changes') {
            steps {
                script {
                    def changes = sh(script: 'git diff --name-only HEAD~1 HEAD', returnStdout: true).trim()
                    if (changes.isEmpty()) {
                        currentBuild.result = 'SUCCESS'
                        error('No changes detected. Skipping pipeline.')
                    }
                }
            }
        }

        stage('Run Application Tests') {
            steps {
                dir('backend') {
                    script {
                        sh 'python3 shodan_app.py &'
                        sh 'sleep 10'
                        sh 'curl -f http://localhost:5055/api/health || (echo "App health check failed" && exit 1)'
                        sh 'pkill -f shodan_app.py'
                    }
                }
            }
        }

        stage('Build and Tag Docker Image') {
            steps {
                dir('backend') {
                    withCredentials([usernamePassword(credentialsId: env.DOCKER_CREDENTIALS_ID, usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                        sh '''
                            echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin
                            docker pull $DOCKER_IMAGE:latest
                            docker tag $DOCKER_IMAGE:latest $DOCKER_IMAGE:$IMAGE_TAG
                            docker push $DOCKER_IMAGE:$IMAGE_TAG
                            docker buildx create --use
                            docker buildx build --platform linux/amd64,linux/arm64 -t $DOCKER_IMAGE:latest --push .
                        '''
                    }
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}